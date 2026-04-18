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
        <input
          id="patient-name"
          className="text-input"
          type="text"
          placeholder="Patient name (optional)"
          value={value.patientName}
          onChange={(event) => handleFieldChange("patientName", event.target.value)}
        />
      </div>
      <div className="field-group">
        <input
          id="disease"
          className="text-input"
          type="text"
          placeholder="Condition or disease"
          value={value.disease}
          onChange={(event) => handleFieldChange("disease", event.target.value)}
        />
      </div>
      <div className="field-group">
        <input
          id="intent-query"
          className="text-input"
          type="text"
          placeholder="What do you want to know?"
          value={value.intentQuery}
          onChange={(event) => handleFieldChange("intentQuery", event.target.value)}
        />
      </div>
      <div className="field-group">
        <input
          id="location"
          className="text-input"
          type="text"
          placeholder="Location for trials (optional)"
          value={value.location}
          onChange={(event) => handleFieldChange("location", event.target.value)}
        />
      </div>
    </div>
  );
}

export default StructuredQueryForm;
