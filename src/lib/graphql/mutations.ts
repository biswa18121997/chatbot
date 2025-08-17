import { gql } from '@apollo/client';

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!, $user_id: uuid!) {
    insert_chats_one(object: { title: $title, user_id: $user_id }) {
      id
      title
      user_id
      created_at
      updated_at
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($chat_id: uuid!, $user_id: uuid!, $content: String!) {
    insert_messages_one(
      object: { chat_id: $chat_id, user_id: $user_id, content: $content, is_bot: false }
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

export const SEND_MESSAGE_TO_BOT = gql`
  mutation SendMessageToBot($chat_id: uuid!, $content: String!) {
    sendMessage(chat_id: $chat_id, content: $content) {
      success
      message
      response
    }
  }
`;

export const UPDATE_CHAT_TITLE = gql`
  mutation UpdateChatTitle($chat_id: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: { id: $chat_id }, _set: { title: $title }) {
      id
      title
      updated_at
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation DeleteChat($chat_id: uuid!) {
    delete_messages(where: { chat_id: { _eq: $chat_id } }) {
      affected_rows
    }
    delete_chats_by_pk(id: $chat_id) {
      id
    }
  }
`;