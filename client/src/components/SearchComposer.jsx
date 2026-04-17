function SearchComposer({ query, onQueryChange, onSearch }) {
  return (
    <div className="search-composer">
      <label className="field-label" htmlFor="research-query">
        Natural Query
      </label>
      <div className="search-row">
        <input
          id="research-query"
          className="text-input"
          type="text"
          placeholder="Example: Latest treatment for lung cancer"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <button className="primary-button" type="button" onClick={onSearch}>
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchComposer;

