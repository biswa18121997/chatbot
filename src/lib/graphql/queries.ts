import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats($user_id: uuid!) {
    chats(
      where: { user_id: { _eq: $user_id } }
      order_by: { updated_at: desc }
    ) {
      id
      title
      user_id
      created_at
      updated_at
      messages(order_by: { created_at: asc }, limit: 1) {
        id
        content
        is_bot
        created_at
      }
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($chat_id: uuid!) {
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

export const GET_CHAT_DETAILS = gql`
  query GetChatDetails($chat_id: uuid!) {
    chats_by_pk(id: $chat_id) {
      id
      title
      user_id
      created_at
      updated_at
      messages(order_by: { created_at: asc }) {
        id
        content
        is_bot
        created_at
        user_id
      }
    }
  }
`;