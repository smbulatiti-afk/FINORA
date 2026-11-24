"use client";

export function ConfirmDialog({ message, onCancel, onConfirm }: { message: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal-head"><h2 className="modal-title" id="confirm-title">Confirm deletion</h2></div>
      <p className="subtitle">{message}</p>
      <div className="form-footer"><button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button><button type="button" className="btn btn-danger" onClick={onConfirm}>Delete</button></div>
    </section>
  </div>;
}
