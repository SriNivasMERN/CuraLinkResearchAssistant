function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  isLoading,
  className = "",
}) {
  return (
    <aside className={`conversation-sidebar ${className}`.trim()}>
      <div className="sidebar-header">
        <p className="eyebrow">History</p>
        <h3>Recent Searches</h3>
        <p className="sidebar-copy">Open an earlier search again.</p>
      </div>

      {isLoading ? (
        <p className="muted-copy">Loading past searches...</p>
      ) : !conversations.length ? (
        <p className="muted-copy">Your earlier searches will appear here.</p>
      ) : (
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button
              key={conversation._id}
              type="button"
              className={`conversation-item ${
                activeConversationId === conversation._id ? "conversation-item-active" : ""
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <span className="conversation-title">{conversation.title}</span>
              <span className="conversation-meta">
                {conversation.activeDiseaseContext || "General health question"}
              </span>
              <span className="conversation-date">
                {new Date(conversation.updatedAt).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default ConversationSidebar;
