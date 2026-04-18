function SearchComposer({ query, onQueryChange, onSearch }) {
  return (
    <div className="search-composer">
      <div className="search-row">
        <input
          id="research-query"
          className="text-input search-input-prominent"
          type="text"
          autoFocus
          placeholder="Ask about a disease, treatment, supplement, or trial"
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
