/**
 * Engine conformance contract (proposal).
 *
 * BUILD_ENGINES is a hand-edited list. This module describes what an engine
 * must be able to do before the office can rely on it, and records, per
 * operating system, whether that has been verified. An engine is offerable
 * only when every required capability is 'pass' on the owner's OS.
 *
 * Pure and electron-free on purpose, so node --test can load it.
 */
import type { AgentProvider } from './agentProvider';

export type EngineCapability =
  /** Live status events reach the hive (working, idle, stopped). */
  | 'lifecycleHooks'
  /** Mail left for the agent is delivered when it goes idle. */
  | 'inboxDelivery'
  /** The agent can only write inside its own folder; Michael reads, never writes. */
  | 'folderIsolation'
  /** The agent reaches integrations through the loopback broker, never seeing a secret. */
  | 'integrationBroker'
  /** Token usage and cost are reported back to the app. */
  | 'costReporting'
  /** A session can be resumed after a restart. */
  | 'sessionResume';

export const ALL_CAPABILITIES: readonly EngineCapability[] = [
  'lifecycleHooks',
  'inboxDelivery',
  'folderIsolation',
  'integrationBroker',
  'costReporting',
  'sessionResume'
];

export type CapabilityStatus = 'pass' | 'fail' | 'unverified';
export type ConformanceOs = 'darwin' | 'win32' | 'linux';
export type CapabilityRow = Record<EngineCapability, CapabilityStatus>;
export type EngineConformance = Record<ConformanceOs, CapabilityRow>;

const unverified = (): CapabilityRow => ({
  lifecycleHooks: 'unverified',
  inboxDelivery: 'unverified',
  folderIsolation: 'unverified',
  integrationBroker: 'unverified',
  costReporting: 'unverified',
  sessionResume: 'unverified'
});

/**
 * Starting point. Codex only: its preset already has a hook bridge, a resume
 * subcommand and an OS sandbox flag, so it is the closest to ready. Nothing
 * is marked 'pass' until the conformance harness has actually run.
 */
export const ENGINE_CONFORMANCE: Partial<Record<AgentProvider, EngineConformance>> = {
  codex: { darwin: unverified(), win32: unverified(), linux: unverified() }
};

/** Capabilities that are not yet 'pass' for this engine on this OS. */
export function missingCapabilities(
  record: EngineConformance | undefined,
  os: ConformanceOs,
  required: readonly EngineCapability[] = ALL_CAPABILITIES
): EngineCapability[] {
  if (!record) return [...required];
  return required.filter((c) => record[os][c] !== 'pass');
}

/** Offer an engine only with evidence for every required capability. */
export function isEngineOfferable(
  record: EngineConformance | undefined,
  os: ConformanceOs,
  required: readonly EngineCapability[] = ALL_CAPABILITIES
): boolean {
  return missingCapabilities(record, os, required).length === 0;
}
