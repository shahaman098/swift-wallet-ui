import React, { useMemo } from 'react'

type ManagedBridgeJob = {
  status?: string
  depositTxHash?: string | null
  approveTxHash?: string | null
  burnTxHash?: string | null
  attestation?: string | null
  mintTxHash?: string | null
  payoutTxHash?: string | null
}

export function BridgeStepper({
  job,
  status,
  output,
}: {
  job: ManagedBridgeJob | null
  status: string
  output?: string
}) {
  const explorerBase = (import.meta as any)?.env?.VITE_EXPLORER_URL || ''

  const steps = useMemo(() => {
    // UI-only inference of progress; we do NOT change backend logic.
    const initiated =
      Boolean(job) ||
      /submitted|bridging|awaiting/i.test(status) ||
      Boolean(output)
    const messageDetected = Boolean(job?.burnTxHash)
    const attestationReceived = Boolean(job?.attestation)
    const completed =
      /completed/i.test(job?.status || '') ||
      /complete/i.test(status) ||
      Boolean(job?.mintTxHash || job?.payoutTxHash)

    return [
      {
        key: 'initiated',
        title: 'Initiated',
        done: initiated,
        helper:
          'Bridge initiated. Your request has been submitted to the source chain.',
        tx: job?.depositTxHash || job?.approveTxHash || null,
      },
      {
        key: 'message',
        title: 'Message Detected',
        done: messageDetected || attestationReceived || completed,
        helper:
          'Message observed on source chain. Waiting for attestation on Circle.',
        tx: job?.burnTxHash || null,
      },
      {
        key: 'attestation',
        title: 'Attestation Received',
        done: attestationReceived || completed,
        helper:
          'Attestation received from Circle. Ready to finalize on destination chain.',
        tx: job?.attestation || null,
        isAttestation: true,
      },
      {
        key: 'completed',
        title: 'Completed on Arc',
        done: completed,
        helper:
          'Bridge completed. Funds minted/paid out on destination chain.',
        tx: job?.mintTxHash || job?.payoutTxHash || null,
      },
    ]
  }, [job, status, output])

  return (
    <div style={styles.wrapper}>
      {/* Inline CSS animations to avoid new deps */}
      <style>{keyframes}</style>
      <h2 style={styles.heading}>Cross-Chain Bridge Progress</h2>
      <p style={styles.subheading}>
        This UI reflects live status inferred from your current bridge job. No
        backend changes required.
      </p>

      {/* Animated beam path */}
      <div style={styles.beamRow}>
        <div style={styles.chainPill}>Source</div>
        <div style={styles.beam}>
          <div
            style={{
              ...styles.beamDot,
              animationDelay: '0s',
            }}
          />
          <div
            style={{
              ...styles.beamDot,
              animationDelay: '0.2s',
            }}
          />
          <div
            style={{
              ...styles.beamDot,
              animationDelay: '0.4s',
            }}
          />
        </div>
        <div style={styles.chainPillDark}>Arc</div>
      </div>

      {/* Stepper */}
      <div style={styles.stepsGrid}>
        {steps.map((step, idx) => (
          <div key={step.key} style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div
                style={{
                  ...styles.stepCircle,
                  ...(step.done ? styles.stepCircleDone : {}),
                }}
              >
                {step.done ? '✓' : idx + 1}
              </div>
              <div style={styles.stepTitle}>{step.title}</div>
            </div>
            <div style={styles.stepHelper}>{step.helper}</div>
            {step.tx && (
              <div style={styles.txRow}>
                <div style={styles.txLabel}>
                  {step.isAttestation ? 'attestation' : 'tx'}:
                </div>
                <code style={styles.txHash}>
                  {String(step.tx).slice(0, 10)}…
                </code>
                {explorerBase ? (
                  <a
                    href={`${explorerBase}/${
                      step.isAttestation ? 'attestation' : 'tx'
                    }/${step.tx}`}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.txLink}
                  >
                    View
                  </a>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Helpful note */}
      <div style={styles.notes}>
        <strong>Tip:</strong> If a step appears stuck, you can retry the last
        action in the main form. This UI will auto-advance as the backend job
        updates.
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    border: '1px solid rgba(15,23,42,0.12)',
    borderRadius: '16px',
    padding: '16px',
    background: '#fff',
    boxShadow: '0 20px 35px -30px rgba(15, 23, 42, 0.35)',
    marginTop: '16px',
  },
  heading: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
  },
  subheading: {
    fontSize: '0.9rem',
    opacity: 0.7,
    marginTop: '6px',
    marginBottom: '12px',
  },
  beamRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  chainPill: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#eef2ff',
    border: '1px solid rgba(59,130,246,0.25)',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#1d4ed8',
  },
  chainPillDark: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#ecfeff',
    border: '1px solid rgba(20,184,166,0.25)',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#0f766e',
  },
  beam: {
    position: 'relative',
    height: '6px',
    background:
      'linear-gradient(90deg, rgba(59,130,246,0.15), rgba(20,184,166,0.15))',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  beamDot: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, rgba(59,130,246,1), rgba(20,184,166,1))',
    animation: 'beam-move 1.4s linear infinite',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px',
  },
  stepCard: {
    border: '1px solid rgba(15,23,42,0.12)',
    borderRadius: '12px',
    padding: '12px',
    background: '#fff',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  stepCircle: {
    width: '26px',
    height: '26px',
    borderRadius: '999px',
    border: '2px solid rgba(15,23,42,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#64748b',
    background: '#f8fafc',
  },
  stepCircleDone: {
    border: '2px solid rgba(20,184,166,0.5)',
    color: '#0f766e',
    background: '#ecfeff',
    boxShadow: '0 0 0 4px rgba(20,184,166,0.08)',
  },
  stepTitle: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  stepHelper: {
    fontSize: '0.85rem',
    opacity: 0.8,
    marginBottom: '8px',
  },
  txRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
  },
  txLabel: {
    opacity: 0.7,
  },
  txHash: {
    background: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  txLink: {
    color: '#0ea5e9',
    textDecoration: 'none',
  },
  notes: {
    fontSize: '0.8rem',
    marginTop: '10px',
    opacity: 0.8,
  },
}

const keyframes = `
@keyframes beam-move {
  0% { left: -8px; opacity: .2; }
  50% { opacity: 1; }
  100% { left: calc(100% + 8px); opacity: .2; }
}
`


