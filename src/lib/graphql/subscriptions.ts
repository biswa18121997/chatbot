import { gql } from '@apollo/client';

export const MESSAGES_SUBSCRIPTION = gql`
  subscription MessagesSubscription($chat_id: uuid!) {
    messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      chat_id
      user_id
      content
      is_bot
      created_at
    }
  }
`;

export const CHATS_SUBSCRIPTION = gql`
  subscription ChatsSubscription($user_id: uuid!) {
    chats(
      where: { user_id: { _eq: $user_id } }
      order_by: { updated_at: desc }
    ) {
      id
      title
      user_id
      created_at
      updated_at
    }
  }
`;