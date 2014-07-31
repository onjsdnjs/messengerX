angular.module('starter.constants', [])

  .constant('APP_INFO', {
    version: '1.0 BETA',
    feedVersion: 'V1',
    appKey : 'messengerx'
  })
  .constant('BASE_URL', 'stalk-front-s01.cloudapp.net')
  .constant('DB_CONFIG', {
    name: 'stalk.db',
    version: '0.1',
    tables: [
      {
        name: 'TB_MESSAGE',
        columns: [
          {name: 'channel_id',   type: 'text'},
          {name: 'sender_id',  type: 'text'},
          {name: 'sender_name',  type: 'text'},
          {name: 'sender_image',  type: 'text'},
          {name: 'message',    type: 'text'},
          {name: 'type', type: 'text'},
          {name: 'time', type: 'integer'},
          {name: 'owner_id', type: 'text'}
        ],
        table_index : [{ type : '', name : 'IDX_TB_MESSAGE', columns : [ 'channel_id', 'owner_id' ] }]
      },
      {
        name: 'TB_CHANNEL',
        columns: [
          //{name: '_id',     type: 'integer primary key autoincrement'},
          {name: 'channel_id',   type: 'text'},
          {name: 'channel_name',  type: 'text'},
          {name: 'channel_users',    type: 'text'},
          {name: 'channel_image', type: 'text DEFAULT "" '},
          {name: 'unread_count', type: 'integer'},
          {name: 'latest_message', type: 'text'},
          {name: 'channel_updated', type: 'integer'},
          {name: 'owner_id', type: 'text'}
        ],
        table_index : [{ type : 'UNIQUE', name : 'IDX_U_TB_CHANNEL', columns : [ 'channel_id', 'owner_id' ] }, { type : '', name : 'IDX_TB_CHANNEL', columns : [ 'owner_id' ] }]
      },
      {
        name: 'TB_USER',
        columns: [
          {name: 'user_id',   type: 'text'},
          {name: 'user_name',  type: 'text'},
          {name: 'message',    type: 'text'},
          {name: 'image', type: 'text'},
          {name: 'chosung', type: 'text'},
          {name: 'owner_id', type: 'text'}
        ],
        table_index : [
          { type : 'UNIQUE', name : 'IDX_U_TB_USER', columns : [ 'user_id', 'owner_id' ] },
          { type : '', name : 'IDX_TB_USER', columns : [ 'owner_id' ] }
        ]
      },
      {
        name: 'TB_EMOTICON',
        columns: [
          {name: 'group_id',   type: 'text'},
          {name: 'tag',  type: 'text'},
          {name: 'image',    type: 'text'},
          {name: 'owner_id', type: 'text'}
        ],
        table_index : [{ type : '', name : 'IDX_TB_EMOTICON', columns : [ 'owner_id' ] }]
      }
    ]
});