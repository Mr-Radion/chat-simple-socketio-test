import React from 'react';
import socket from '../socket';

function Chat({ users, messages, userName, roomId, onAddMessage }: any) {
  const [messageValue, setMessageValue] = React.useState('');
  const messagesRef = React.useRef<any>(null);

  const onSendMessage = () => {
    // Отправляю на сервер через сокет, текущую комнату, юзера и сообщение
    socket.emit('ROOM:NEW_MESSAGE', {
      userName,
      roomId,
      text: messageValue,
    });
    onAddMessage({ userName, text: messageValue });
    setMessageValue('');
  };

  // Как только у нас добавляется новое сообщение, должен происходить скрол вниз списка сообщений
  React.useEffect(() => {
    messagesRef.current.scrollTo(0, 99999);
  }, [messages]);

  return (
    <div className="chat">
      <div className="chat-users">
        Комната: <b>{roomId}</b>
        <div>
          <b>Онлайн {users.length}</b>
        </div>
        <hr />
        <ul>
          {users.map((name: string, index: number) => (
            <li key={name + index}>{name}</li>
          ))}
        </ul>
      </div>
      <div className="chat-messages">
        <div ref={messagesRef} className="messages">
          {messages.map((message: any, index: number) => (
            <div className="message" key={`${message.text}_${index}`}>
              <p>{message.text}</p>
              <div>
                <span>{message.userName}</span>
              </div>
            </div>
          ))}
        </div>
        <form>
          <textarea
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
            className="form-control"
            rows={3}></textarea>
          <button onClick={onSendMessage} type="button" className="btn btn-primary">
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
