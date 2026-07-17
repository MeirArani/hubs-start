// TODO this has to happen before all components are defined. Is there a better spot to be doing this?
//setDefaultSize(10000);
//setRemovedReuseThreshold(0.2);

const DefaultComponentSize = 10000;

export const $isStringType = Symbol('isStringType');

export const Networked = {
  id: new Uint32Array(DefaultComponentSize),
  creator: new Uint32Array(DefaultComponentSize),
  owner: new Uint32Array(DefaultComponentSize),
  lastOwnerTime: new Uint32Array(DefaultComponentSize),
  timestamp: new Uint32Array(DefaultComponentSize),
};
Networked.id[$isStringType] = true;
Networked.creator[$isStringType] = true;
Networked.owner[$isStringType] = true;

export const Owned = {};
export const EntityStateDirty = {};
export const NetworkedMediaFrame = {
  capturedNid: new Uint32Array(DefaultComponentSize),
  scale: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
};
NetworkedMediaFrame.capturedNid[$isStringType] = true;

export const MediaFrame = {
  capturedNid: new Uint32Array(DefaultComponentSize),
  scale: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  mediaType: new Uint8Array(DefaultComponentSize),
  bounds: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  align: [
    new Uint8Array(DefaultComponentSize),
    new Uint8Array(DefaultComponentSize),
    new Uint8Array(DefaultComponentSize),
  ],
  guide: [] as number[],
  preview: [] as number[],
  previewingNid: [] as number[],
  flags: new Uint8Array(DefaultComponentSize),
};
export const TextTag = {};
export const ReflectionProbe = {};
export const Slice9 = {
  insets: [
    new Uint32Array(DefaultComponentSize),
    new Uint32Array(DefaultComponentSize),
    new Uint32Array(DefaultComponentSize),
    new Uint32Array(DefaultComponentSize),
  ],
  size: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
};
export const NetworkedTransform = {
  position: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  rotation: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  scale: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
};
export const AEntity = {};
export const Object3DTag = {};
export const GLTFModel = {};
export const LightTag = {};
export const AmbientLightTag = {};
export const DirectionalLight = {};
export const HemisphereLightTag = {};
export const PointLightTag = {};
export const SpotLightTag = {};
export const CursorRaycastable = {};
export const RemoteHoverTarget = {};
export const NotRemoteHoverTarget = {};
export const Holdable = {};
export const RemoveNetworkedEntityButton = {};
export const Interacted = {};
export const HandRight = {};
export const HandLeft = {};
export const RemoteRight = {};
export const RemoteLeft = {};
export const HoveredHandRight = {};
export const HoveredHandLeft = {};
export const HoveredRemoteRight = {};
export const HoveredRemoteLeft = {};
export const HoverableVisuals = {
  geometryRadius: new Float32Array(DefaultComponentSize),
};
/**
 * @type {Map<EntityId, Uniform[]}>}
 */
export const HoverableVisualsUniforms = new Map();
export const HeldHandRight = {};
export const HeldHandLeft = {};
export const HeldRemoteRight = {};
export const HeldRemoteLeft = {};
export const Held = {};
export const Constraint = {};
export const ConstraintHandRight = {};
export const ConstraintHandLeft = {};
export const ConstraintRemoteRight = {};
export const ConstraintRemoteLeft = {};
export const OffersRemoteConstraint = {};
export const HandCollisionTarget = {};
export const OffersHandConstraint = {};
export const TogglesHoveredActionSet = {};
export const HoverButton = { type: new Uint8Array(DefaultComponentSize) };
export const TextButton = { labelRef: [] as number[] };
export const HoldableButton = {};
export const SingleActionButton = {};
export const Pen = {};
export const PenActive = {};
export const PenUpdated = {};
export const HoverMenuChild = {};
export const Static = {};
export const Inspectable = {
  flags: new Uint8Array(DefaultComponentSize),
};
export const Inspected = {};
export const PreventAudioBoost = {};
export const IgnoreSpaceBubble = {};
export const Rigidbody = {
  bodyId: new Uint16Array(DefaultComponentSize),
  mass: new Float32Array(DefaultComponentSize),
  gravity: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  linearDamping: new Float32Array(DefaultComponentSize),
  angularDamping: new Float32Array(DefaultComponentSize),
  linearSleepingThreshold: new Float32Array(DefaultComponentSize),
  angularSleepingThreshold: new Float32Array(DefaultComponentSize),
  angularFactor: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  type: new Uint8Array(DefaultComponentSize),
  activationState: new Uint8Array(DefaultComponentSize),
  collisionFilterGroup: new Uint32Array(DefaultComponentSize),
  collisionFilterMask: new Uint32Array(DefaultComponentSize),
  flags: new Uint8Array(DefaultComponentSize),
};
export const PhysicsShape = {
  bodyId: new Uint16Array(DefaultComponentSize),
  shapeId: new Uint16Array(DefaultComponentSize),
  type: new Uint8Array(DefaultComponentSize),
  fit: new Uint8Array(DefaultComponentSize),
  halfExtents: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  minHalfExtent: new Float32Array(DefaultComponentSize),
  maxHalfExtent: new Float32Array(DefaultComponentSize),
  sphereRadius: new Float32Array(DefaultComponentSize),
  cylinderAxis: new Uint8Array(DefaultComponentSize),
  margin: new Float32Array(DefaultComponentSize),
  offset: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  orientation: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  heightfieldData: [new Float32Array(DefaultComponentSize)],
  heightfieldDistance: new Float32Array(DefaultComponentSize),
  flags: new Uint8Array(DefaultComponentSize),
};
export const DestroyAtExtremeDistance = {};
export const MediaLoading = {};
export const FloatyObject = {
  flags: new Uint8Array(DefaultComponentSize),
  releaseGravity: new Float32Array(DefaultComponentSize),
};
export const NetworkedFloatyObject = {
  flags: new Uint8Array(DefaultComponentSize),
};
export const MakeKinematicOnRelease = {};
export const CameraTool = {
  snapTime: new Float32Array(DefaultComponentSize),
  state: new Uint8Array(DefaultComponentSize),
  captureDurIdx: new Uint8Array(DefaultComponentSize),
  trackTarget: [] as number[],

  snapMenuRef: [] as number[],
  nextButtonRef: [] as number[],
  prevButtonRef: [] as number[],
  snapRef: [] as number[],
  cancelRef: [] as number[],
  recVideoRef: [] as number[],
  screenRef: [] as number[],
  selfieScreenRef: [] as number[],
  cameraRef: [] as number[],
  countdownLblRef: [] as number[],
  captureDurLblRef: [] as number[],
  sndToggleRef: [] as number[],
};
export const MyCameraTool = {};
export const MediaLoader = {
  src: new Uint32Array(DefaultComponentSize),
  flags: new Uint8Array(DefaultComponentSize),
  fileId: new Uint32Array(DefaultComponentSize),
  count: new Uint8Array(DefaultComponentSize),
  mediaRef: [] as number[],
};

MediaLoader.src[$isStringType] = true;
MediaLoader.fileId[$isStringType] = true;
export const MediaLoaderOffset = {};
export const MediaLoaded = {};
export const LoadedByMediaLoader = {};
export const MediaRefresh = {};
export const MediaContentBounds = {
  bounds: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
};
export const MediaInfo = {
  accessibleUrl: new Uint32Array(DefaultComponentSize),
  contentType: new Uint32Array(DefaultComponentSize),
  mediaType: new Uint8Array(DefaultComponentSize),
};
MediaInfo.accessibleUrl[$isStringType] = true;
MediaInfo.contentType[$isStringType] = true;

// MediaImageLoaderData and MediaVideoLoaderData are
// for parameters that are set at glTF inflators
// inflateImageLoader and inflateVideoLoader and
// are needed to be transported to util image/audio loaders.
// They are handled as part of MediaLoader component data.

/**
 * @type {Map<EntityId, {
 *   alphaCutoff: number,
 *   alphaMode: AlphaMode,
 *   projection: ProjectionMode
 * }>}
 */
export const MediaImageLoaderData = new Map();

/**
 * @type {Map<EntityId, {
 *   loop: boolean,
 *   autoPlay: boolean,
 *   controls: boolean,
 *   projection: ProjectionMode
 * }>}
 */
export const MediaVideoLoaderData = new Map();

export const SceneRoot = {};
export const NavMesh = {};
export const SceneLoader = { src: new Uint32Array(DefaultComponentSize) };
SceneLoader.src[$isStringType] = true;

export const MediaImage = {
  cacheKey: new Uint32Array(DefaultComponentSize),
  projection: new Uint8Array(DefaultComponentSize),
  alphaMode: new Uint8Array(DefaultComponentSize),
  alphaCutoff: new Float32Array(DefaultComponentSize),
};
MediaImage.cacheKey[$isStringType] = true;

export const NetworkedPDF = {
  pageNumber: new Uint8Array(DefaultComponentSize),
};
export const MediaPDF = {
  pageNumber: new Uint8Array(DefaultComponentSize),
  map: new Map(),
};
export const MediaPDFUpdated = {
  pageNumber: new Uint8Array(DefaultComponentSize),
};

export const MediaVideo = {
  ratio: new Float32Array(DefaultComponentSize),
  flags: new Uint8Array(DefaultComponentSize),
  projection: new Uint8Array(DefaultComponentSize),
  lastUpdate: new Uint32Array(DefaultComponentSize),
};
export const MediaVideoUpdated = {};
/**
 * @type {Map<EntityId, HTMLVideoElement}>}
 */
export const MediaVideoData = new Map();
export const MixerAnimatableInitialize = {};
export const MixerAnimatable = {};
/**
 * @type {Map<EntityId, AnimationMixer}>}
 */
export const MixerAnimatableData = new Map();
export const LoopAnimationInitialize = {};
/**
 * @type {Map<EntityId, {
 *          activeClipIndices: number[],
 *          clip: number,
 *          paused: boolean,
 *          startOffset: number,
 *          timeScale: number
 *        }[]>}
 */
export const LoopAnimationInitializeData = new Map();
export const LoopAnimation = {};
/**
 * @type {Map<EntityId, AnimationAction[]>}
 */
export const LoopAnimationData = new Map();
export const NetworkedVideo = {
  time: new Float32Array(DefaultComponentSize),
  flags: new Uint8Array(DefaultComponentSize),
};
export const VideoMenuItem = {};
export const VideoMenu = {
  videoRef: [] as number[],
  sliderRef: [] as number[],
  timeLabelRef: [] as number[],
  trackRef: [] as number[],
  headRef: [] as number[],
  playIndicatorRef: [] as number[],
  pauseIndicatorRef: [] as number[],
  snapRef: [] as number[],
  volUpRef: [] as number[],
  volDownRef: [] as number[],
  clearTargetTimer: new Float64Array(DefaultComponentSize),
};
export const AudioEmitter = {
  flags: new Uint8Array(DefaultComponentSize),
  audios: new Map(),
  AudioEmitter: new Map(),
};
export const AudioSettingsChanged = {};
export const Deletable = {};
export const Deleting = {};
export const EnvironmentSettings = { map: new Map() };

// TODO: Store this data elsewhere, since only one or two will ever exist.
export const ObjectMenu = {
  backgroundRef: [] as number[],
  pinButtonRef: [] as number[],
  unpinButtonRef: [] as number[],
  cameraFocusButtonRef: [] as number[],
  cameraTrackButtonRef: [] as number[],
  removeButtonRef: [] as number[],
  dropButtonRef: [] as number[],
  inspectButtonRef: [] as number[],
  deserializeDrawingButtonRef: [] as number[],
  openLinkButtonRef: [] as number[],
  refreshButtonRef: [] as number[],
  cloneButtonRef: [] as number[],
  rotateButtonRef: [] as number[],
  mirrorButtonRef: [] as number[],
  scaleButtonRef: [] as number[],
  targetRef: [] as number[],
  handlingTargetRef: [] as number[],
  flags: new Uint8Array(DefaultComponentSize),
};
export const ObjectDropped = {};
export const MediaMirrored = {
  linkedRef: [] as number[],
};
export const MirroredMedia = {
  linkedRef: [] as number[],
};
export const LinkedMedia = {
  linkedRef: [] as number[],
};
export const FollowInFov = {
  offset: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  angle: new Float32Array(DefaultComponentSize),
  speed: new Float32Array(DefaultComponentSize),
  started: new Uint8Array(DefaultComponentSize),
};
export const MirrorMenu = {
  closeRef: [] as number[],
  mirrorTargetRef: [] as number[],
  flags: new Uint8Array(DefaultComponentSize),
};
export const AvatarPOVNode = {};
// TODO: Store this data elsewhere, since only one or two will ever exist.
export const LinkHoverMenu = {
  targetObjectRef: [] as number[],
  linkButtonRef: [] as number[],
  clearTargetTimer: new Float64Array(DefaultComponentSize),
};
export const LinkHoverMenuItem = {};
export const Link = {
  url: new Uint32Array(DefaultComponentSize),
  type: new Uint8Array(DefaultComponentSize),
};
Link.url[$isStringType] = true;
export const LinkInitializing = {};
// TODO: Store this data elsewhere, since only one or two will ever exist.
export const PDFMenu = {
  prevButtonRef: [] as number[],
  nextButtonRef: [] as number[],
  pageLabelRef: [] as number[],
  snapRef: [] as number[],
  targetRef: [] as number[],
  clearTargetTimer: new Float64Array(DefaultComponentSize),
};
export const ObjectMenuTarget = {
  flags: new Uint8Array(DefaultComponentSize),
};
export const MediaSnapped = {};
export const NetworkDebug = {};
export const NetworkDebugRef = {
  ref: [] as number[],
};
export const Waypoint = {
  flags: new Uint8Array(DefaultComponentSize),
};
export const NetworkedWaypoint = {
  occupied: new Uint8Array(DefaultComponentSize),
};
export const WaypointPreview = {};
export const Skybox = {};
export const ObjectSpawner = {
  src: new Uint32Array(DefaultComponentSize),
  flags: new Uint8Array(DefaultComponentSize),
};
export const Billboard = {
  onlyY: new Uint8Array(DefaultComponentSize),
};
export const MaterialTag = {};
export const UVScroll = {
  speed: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  increment: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
  offset: [
    new Float32Array(DefaultComponentSize),
    new Float32Array(DefaultComponentSize),
  ],
};
export const VideoTextureSource = {
  fps: new Uint8Array(DefaultComponentSize),
  resolution: [
    new Uint16Array(DefaultComponentSize),
    new Uint16Array(DefaultComponentSize),
  ],
};
export const VideoTextureTarget = {
  source: [] as number[],
  flags: new Uint8Array(DefaultComponentSize),
};
export const SimpleWater = {};
export const Mirror = {};
export const ParticleEmitterTag = {
  src: new Uint32Array(DefaultComponentSize),
};
export const AudioZone = {
  flags: new Uint8Array(DefaultComponentSize),
};
export const AudioTarget = {
  minDelay: new Uint32Array(DefaultComponentSize),
  maxDelay: new Uint32Array(DefaultComponentSize),
  source: [] as number[],
  flags: new Uint8Array(DefaultComponentSize),
};
export const AudioSource = {
  flags: new Uint8Array(DefaultComponentSize),
};
export const AudioParams = {};
export const ScenePreviewCamera = {
  duration: new Float32Array(DefaultComponentSize),
  positionOnly: new Uint8Array(DefaultComponentSize),
};
export const LinearTranslate = {
  duration: new Float32Array(DefaultComponentSize),
  targetX: new Float32Array(DefaultComponentSize),
  targetY: new Float32Array(DefaultComponentSize),
  targetZ: new Float32Array(DefaultComponentSize),
};
export const LinearRotate = {
  duration: new Float32Array(DefaultComponentSize),
  targetX: new Float32Array(DefaultComponentSize),
  targetY: new Float32Array(DefaultComponentSize),
  targetZ: new Float32Array(DefaultComponentSize),
  targetW: new Float32Array(DefaultComponentSize),
};
export const LinearScale = {
  duration: new Float32Array(DefaultComponentSize),
  targetX: new Float32Array(DefaultComponentSize),
  targetY: new Float32Array(DefaultComponentSize),
  targetZ: new Float32Array(DefaultComponentSize),
};
export const Quack = {};
export const TrimeshTag = {};
export const HeightFieldTag = {};
export const LocalAvatar = {};
export const RemoteAvatar = {};
export const MediaLink = {
  src: new Uint32Array(DefaultComponentSize),
};
MediaLink.src[$isStringType] = true;
export const ObjectMenuTransform = {
  targetObjectRef: [] as number[],
  prevObjectRef: [] as number[],
  flags: new Uint8Array(DefaultComponentSize),
};
