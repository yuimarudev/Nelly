module.exports = { };

module.exports.default = {
  aliases: {
    h: 'help',
    j: 'join',
    p: 'play',
    dc: 'disconnect',
    q: 'queue',
    lq: 'loopqueue',
    qloop: 'loopqueue',
    s: 'skip',
    np: 'nowplay',
    rm: 'remove',
    find: 'search',
    auto: 'autoplay'
  },
  commands: {
    ping: { description: 'ping pong', args: [ [] ], details: '' },
    nowplay: {
      description: '今再生してる曲を表示するよ！',
      args: [ [] ],
      details: '引数は不要です(ง ˙-˙ )ง'
    },
    todo: {
      description: 'ToDo List',
      args: [ [ 'subcommand' ], [ 'subcommand', 'data' ] ],
      details: ''
    },
    join: {
      description: 'VCに参加します！',
      args: [ [] ],
      details: '引数は不要です(ง ˙-˙ )ง'
    },
    help: {
      description: '使い方わからん！そんなあなたのために！',
      args: [ [], [ 'コマンド' ] ],
      details: '第一引数はなくてもコマンドのリストが出てくるよ！'
    },
    play: {
      args: [ [ 'query' ] ]
    },
    loopqueue: {
      args: [ [] ]
    },
    disconnect: {
      args: [ [] ]
    },
    queue: {
      args: [ [], [ 'page' ] ]
    },
    skip: { args: [ [], [ 'query' ] ]
    },
    remove: {
      variadic: true,
      args: [ [ 'キュー内でのナンバー', '〃...' ] ]
    },
    search: {
      args: [ [ '検索語句' ], [ '〃', 'フラグ' ] ]
    },
    loop: {
      args: [ [] ]
    },
    autoplay: {
      args: [ [] ]
    },
    eval: {
      args: [ ["code"] ]
    },
    safeeval: {
      args: [ ["code"] ]
    }
  }
}
