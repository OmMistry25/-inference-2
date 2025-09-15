
# Secondary Inference Model - Design Spec

Goal  
Train a production ready model that converts candidate secondary events into final events with calibrated confidence and refined time bounds. Event types include movement, interaction, manipulation, decision proxies, and reactions. The model consumes structured features built from prior detections, tracks, poses, and zone relations. It does not require raw RGB frames in the MVP, but the design allows later fusion with pixels if needed.

---

## 1. Target Outputs

For each candidate c in a window [t0, t1]:
- y_type[k] - probability for each event type in the ontology. Multi label is permitted, but MVP uses single label per candidate.
- score - calibrated confidence for the selected type.
- t_start_refine, t_end_refine - offsets in seconds applied to [t0, t1] for boundary refinement.
- actors_refine - optional re ranking of actor identities when multiple are present.
- explain - list of top features that supported the decision for UI transparency.

---

## 2. Ontology and Label Space

Event families: movement.*, manipulation.*, interaction.*, decision.*, reaction.*.

MVP concrete labels suggested 15 to 25:
- movement.enter, movement.exit, movement.dwell, movement.follow, movement.overtake
- manipulation.reach, manipulation.grasp, manipulation.place
- interaction.handover, interaction.queue, interaction.yield
- decision.choose_route, decision.abort, decision.hesitate
- reaction.startle, reaction.comply, reaction.ignore

The ontology lives in packages/ontology/ontology.yaml and must be versioned. The model reads the active ontology at train and export time and stores a frozen copy inside the artifact metadata.

---

## 3. Inputs and Feature Schemas

3.1 Candidate record
- candidate_id: str
- type_hint: str
- video_id: str
- window_start: float seconds
- window_end: float seconds
- actors: list of str
- objects: list of str optional
- rule_name: str
- rule_score: float

3.2 Per actor time series features
Sampled at constant stride dt inside the candidate window.
- X_actor[T, F_actor]
- F_actor includes kinematics speed, accel, jerk, heading, curvature
- space features box center x,y normalized, box area, aspect ratio
- pose deltas wrist, elbow, shoulder, hip, knee velocities and pairwise distances
- zone flags one hot per zone, line crossing binary
- visibility detection score, occlusion probability
- trigger channels alarms, new entity enters, signal state

3.3 Pairwise relation features
For N actors in the window, precompute a dense or k nearest relation tensor.
- X_rel[T, N, N, F_rel]
- F_rel includes distance, bearing, approach speed, speed alignment, gaze alignment, overlap

3.4 Route graph features for decision events
Optional graph with K nodes and E edges, plus actor projection to closest node.
- G = A[K, K], node_feats[K, Fk], edge_feats[E, Fe]
- route_choice_mask[K]

All tensors are stored in apps/workers/pipelines/cache during training and exposed by a Dataloader.

---

## 4. Model Architecture

4.1 Candidate Scorer MVP
A lightweight Transformer encoder over concatenated per actor streams with pooled relation context.

Steps
1. Encode each actor stream with a 1D temporal Conv block followed by positional encoding.
2. Compute a relation summary per time step using attention over X_rel with actor self as query.
3. Concatenate actor encodings and relation summaries, then apply a temporal Transformer 2 to 4 layers.
4. Temporal pooling with attentive pooling to produce a window embedding z.
5. Heads
   - Classification head Linear, GELU, Linear to number of labels
   - Boundary head predicts delta_start and delta_end in seconds, constrained to half of the window length
   - Optional actor head to re rank actors

Shapes
- Input [T, F_total]
- Hidden size 256
- Layers 3
- Heads 4
- Dropout 0.1

4.2 Reaction Detector trigger aligned
For reaction types, add a small change point module
- Compute velocity and pose entropy features
- A 1D CNN predicts probability of change within a local window after the trigger time
- Combine with the scorer via late fusion p_final = alpha * p_scorer + (1 minus alpha) * p_cp

4.3 Decision Proxy Head
If a route graph is present
- Encode route nodes with an MLP
- Compute attention between the actor temporal embedding and nodes
- Output a categorical distribution over viable routes
- Loss applied only when decision labels exist

4.4 Optional Graph Variant phase 2
Replace step 2 with a Temporal Graph Network
- Nodes are actors, edges come from X_rel at each time step
- Graph Transformer across time with shared weights
- Useful when there are more than 4 actors and interactions dominate

---

## 5. Losses and Optimization

- Classification Focal loss with gamma 2.0, label smoothing 0.05
- Boundary regression Smooth L1 on delta_start and delta_end with time normalization
- Multi task L = L_cls + lambda_b * L_bound + lambda_dec * L_decision
- Class balancing effective number of samples weighting or rebalanced sampler
- Optimizer AdamW, lr 3e-4, betas 0.9 and 0.999, weight decay 0.05
- Scheduler cosine decay with warmup 5 percent of steps
- Mixed precision enabled
Suggested weights lambda_b 0.5, lambda_dec 0.3

---

## 6. Training Data Construction

- Positive samples confirmed events from events table
- Negatives high score candidates rejected by reviewers, plus random windows that overlap no labeled event
- Hard negatives near boundary windows and rule triggered false positives
- Window length 5 to 10 seconds, stride 1 to 2 seconds
- Batch size 64 for CPU prepared features, 16 to 32 for GPU heavy variants
- Data augmentation
  - Time warping on kinematics
  - Track noise small Gaussian noise to boxes and speeds
  - Actor dropout randomly drop a non principal actor to simulate occlusion
  - Zone perturbation by one or two frames to simulate map inaccuracies

---

## 7. Evaluation

Report on validation and test splits
- Event mAP at temporal IoU thresholds 0.3, 0.5, 0.7
- Boundary error MAE in seconds
- Reaction latency MAE relative to trigger
- Decision accuracy when route labels exist
- Calibration ECE and reliability diagrams
- Throughput windows per second and median latency

Ablations
- remove relation features
- remove pose features
- rules only versus rules plus model
- Transformer versus TCN
- change point fusion on or off

---

## 8. Calibration and Thresholding

- Hold out a calibration set from validation
- Temperature scaling on logits to minimize NLL
- Choose per class operating thresholds for desired precision or recall
- Store thresholds and temperature in the exported artifact

---

## 9. Exported Artifacts and Versioning

- model.pt Torch weights
- config.json hyperparameters, feature spec, ontology hash
- calibration.json temperature and thresholds
- schema.json expected tensor shapes and dtypes
- training_report.md metrics and training curves

Artifacts are saved under storage org slash org_id slash project slash project_id slash models slash secondary-scorer slash semver

Semantic versioning
- Major ontology or input schema change
- Minor architecture or training change without breaking input or output
- Patch weight updates or calibration only

---

## 10. Inference Path

1. Build per candidate tensors from cached features
2. Run scorer forward pass
3. If reaction type is suspected, run change point module and fuse
4. Apply calibration temperature and thresholds
5. Create events with refined bounds and confidences

Latency target on a single A10 or L4 GPU
- 1 to 2 ms per candidate for the scorer at T up to 128
- 0.5 ms for the change point module

---

## 11. Training Loop Sketch

for each epoch
- iterate batches
- forward
- compute loss
- backward with grad clip 1.0
- step optimizer and scheduler
- validate and log
- after training, calibrate temperature and export artifacts

---

## 12. Reproducibility

- Fix seeds at framework and dataloader levels
- Log every dependency with versions
- Save the exact ontology.yaml and feature transforms in the artifact
- Include a make train-scorer command and one golden configuration file

---

## 13. Risks and Mitigations

- Tracking identity switches smooth features with tracklet stitching and allow short gaps
- Class imbalance focal loss and class balanced sampling
- Weak labels quality active learning loop and golden set audits
- Overfitting to a dataset scene level split and regularization
- Privacy do not store raw RGB in training cache by default

---

## 14. Roadmap beyond MVP

- Graph Transformer variant for dense interactions
- Multimodal fusion with short RGB or optical flow snippets
- Inverse reinforcement learning for richer decision modeling
- Joint boundary detection with start and end token modeling
- Distillation to a tiny on device model if low latency is needed
