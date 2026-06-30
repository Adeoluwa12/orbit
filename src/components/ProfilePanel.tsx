import React, { useState } from 'react';
import { Profile, profileApi } from '../hooks/api';

interface Props {
  profile: Profile | null;
  onUpdate: (p: Profile) => void;
  onClose: () => void;
}

function EditableList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [input, setInput] = useState('');

  function add() {
    const val = input.trim();
    if (val && !items.includes(val)) {
      onChange([...items, val]);
    }
    setInput('');
  }

  return (
    <div className="editable-list">
      <label className="field-label">{label}</label>
      <div className="chip-list">
        {items.map((item) => (
          <span key={item} className="chip">
            {item}
            <button
              onClick={() => onChange(items.filter((i) => i !== item))}
              className="chip__remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="input-row">
        <input
          className="text-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={`Add ${label.toLowerCase()}...`}
        />
        <button className="btn btn--ghost btn--sm" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}

export default function ProfilePanel({ profile, onUpdate, onClose }: Props) {
  const [companies, setCompanies] = useState(profile?.targetCompanies ?? []);
  const [roles, setRoles] = useState(profile?.targetRoles ?? []);
  const [keywords, setKeywords] = useState(profile?.keywords ?? []);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await profileApi.update({ targetCompanies: companies, targetRoles: roles, keywords });
      onUpdate(res.data.profile);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel__header">
          <h2 className="panel__title">Target Profile</h2>
          <button className="panel__close" onClick={onClose}>✕</button>
        </div>

        <div className="panel__body">
          <EditableList label="Dream Companies" items={companies} onChange={setCompanies} />
          <EditableList label="Target Roles" items={roles} onChange={setRoles} />
          <EditableList label="Keywords" items={keywords} onChange={setKeywords} />
        </div>

        <div className="panel__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
