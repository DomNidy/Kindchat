import Cookies from "js-cookie";

// fromClient (bool): if true this means it is a message we sent and this message object came directly from our client,
// in that case, if the message sender is also our uuid, we SHOULD render it out. This gives the user instant feedback
export const MessageBubble = ({
  messageContent,
  sender,
  displayName,
  timestamp,
  fromClient,
}) => {
  const uuid = Cookies.get("uuid");
  const timestampString = new Date(timestamp).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  // These conditionals ensure we dont render duplicate sessionMessages from the client
  // The way our websocket is setup causes the person who sent the message to also receieve a websocket event when their message is delivered to the websocket server
  // sessionMessages created by the client have a prop 'fromClient' to indicate that a message was not from the server
  // We do this because otherwise the sender of the message would see the delay between them sending their message and its actual delivery
  if (
    // If we sent this message and it is from the client
    (sender == uuid && fromClient) ||
    // If we did not send this message
    sender != uuid ||
    // If fromClient is undefined (it is a database message)
    fromClient === undefined
  ) {
    return (
      <div className="bg-gray-600 rounded-xl p-1">
        <div className="flex flex-row gap-4">
          <p className="text-md align-text-top font-semibold">
            {sender} {displayName}
          </p>
          <p className="font-normal text-sm text-gray-400">{timestampString}</p>
        </div>

        <p className="text-md">{messageContent}</p>
      </div>
    );
  }
};