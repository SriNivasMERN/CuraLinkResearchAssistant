function StructuredQueryForm({ value, onChange }) {
  const handleFieldChange = (field, fieldValue) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className="structured-form">
      <div className="field-group">
        <label className="field-label" htmlFor="patient-name">
          Patient Name
        </label>
        <input
          id="patient-name"
          className="text-input"
          type="text"
          value={value.patientName}
          onChange={(event) => handleFieldChange("patientName", event.target.value)}
        />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="disease">
          Disease of Interest
        </label>
        <input
          id="disease"
          className="text-input"
          type="text"
          value={value.disease}
          onChange={(event) => handleFieldChange("disease", event.target.value)}
        />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="intent-query">
          Additional Query / Intent
        </label>
        <input
          id="intent-query"
          className="text-input"
          type="text"
          value={value.intentQuery}
          onChange={(event) => handleFieldChange("intentQuery", event.target.value)}
        />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          className="text-input"
          type="text"
          value={value.location}
          onChange={(event) => handleFieldChange("location", event.target.value)}
        />
      </div>
    </div>
  );
}

export default StructuredQueryForm;

