import styles from "../styles/styles-chatroom.css";

export default function IncomingFriendRequest(props) {
  const { sender_name, sender_uuid } = props;
  return (
    <div className="incoming-friend-request">
      <p className="incoming-friend-request-default-text">
        Incoming friend request from:
      </p>
      <p className="incoming-friend-request-name">{sender_name}</p>

      <div className="incoming-friend-request-button-container">
        <button
          className="incoming-friend-request-button incoming-friend-request-button-accept"
          onClick={() =>
            console.log(
              "Implement accept friend request functionality in the IncomingFriendRequest component"
            )
          }
        >
          <a>Accept</a>
        </button>

        <button
          className="incoming-friend-request-button incoming-friend-request-button-decline"
          onClick={() =>
            console.log(
              "Implement decline friend request functionality in the IncomingFriendRequest component"
            )
          }
        >
          <a>Decline</a>
        </button>
      </div>
    </div>
  );
}
