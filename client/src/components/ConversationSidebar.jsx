function ConversationSidebar({ conversations, activeConversationId, onSelectConversation, isLoading }) {
  return (
    <aside className="conversation-sidebar">
      <div className="sidebar-header">
        <p className="eyebrow">Conversation Context</p>
        <h3>Recent Searches</h3>
      </div>

      {isLoading ? (
        <p className="muted-copy">Refreshing conversation history...</p>
      ) : !conversations.length ? (
        <p className="muted-copy">No saved conversations yet.</p>
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
                {conversation.activeDiseaseContext || "General research context"}
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
