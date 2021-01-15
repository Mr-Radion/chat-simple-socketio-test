export default (state: any, action: any) => {
  switch (action.type) {
    case 'JOINED':
      return {
        ...state,
        joined: true,
        roomId: action.payload.roomId,
        userName: action.payload.userName,
      };
    case 'SET_DATA':
      return {
        ...state,
        users: action.payload.users,
        messages: action.payload.messages,
      };
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
      };
    case 'NEW_MESSAGE':
      return {
        ...state,
        // Беру все сообщения и добавляю в конце последнее
        messages: [...state.messages, action.payload],
      };
    default:
      return state;
  }
};
