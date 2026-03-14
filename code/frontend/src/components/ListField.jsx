export default function ListField({
  label,
  values,
  onChange,
  placeholder,
  addLabel = 'Ajouter',
}) {
  const handleValueChange = (index, nextValue) => {
    const nextValues = [...values];
    nextValues[index] = nextValue;
    onChange(nextValues);
  };

  const handleAdd = () => {
    onChange([...values, '']);
  };

  const handleRemove = (index) => {
    onChange(values.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="list-field">
      <label>{label}</label>

      {values.length === 0 && (
        <div className="list-field-empty">Aucun élément ajouté pour le moment.</div>
      )}

      {values.map((value, index) => (
        <div key={`${label}-${index}`} className="list-field-row">
          <input
            type="text"
            value={value}
            onChange={(event) => handleValueChange(index, event.target.value)}
            placeholder={placeholder}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleRemove(index)}
          >
            Retirer
          </button>
        </div>
      ))}

      <button type="button" className="btn-secondary" onClick={handleAdd}>
        {addLabel}
      </button>
    </div>
  );
}
