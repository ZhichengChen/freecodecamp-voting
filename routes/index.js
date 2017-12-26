
/*
 * GET home page.
 */
var polls = [{
  id:1,
  username: 'czc555',
  title: '心目中的年度旗舰手机',
  options: ['小米 Mix2','iPhone X','华为 Mate10','三星 Note8'],
  votes: [1527,44689,6587,204],
  status: 1
}];

exports.index = function(req, res) {
  res.render('index', { title: 'FCC 投票系统', user: req.user, polls:polls.filter(function(val){return val.status;}) ,message: req.flash('info') });
};

exports.my = function(req, res) {
  var pollsSize = polls.length;
  var username = req.user.username;
  var result = [];
  for (var i=0;i<pollsSize;i++) {
    if (polls[i].username == username) {
      result.push(polls[i]);
    }
  }
  res.render('vote', {title: '我的投票', user: req.user, polls: result.filter(function(val){return val.status;})});
};

exports.create = function(req, res) {
  
  res.render('create', {title: '发起投票', user: req.user});
};

exports.save = function(req, res) {
  if (!req.body.title) {
    req.flash('info', '标题不能为空');
    return res.render('create', {title: '发起投票', user: req.user ,message: req.flash('info')});
  }
  if (!req.body.options) {
    req.flash('info', '选项不能为空');
    return res.render('create', {title: '发起投票', user: req.user ,message: req.flash('info')});
  }
  var votes = [];
  var options = req.body.options.split('\r\n');
  var optionsSize = options.length;
  for (var i=0;i<optionsSize;i++) {
    votes.push(0);
  }
  polls.push({
    id:polls.length+1,
    username: req.user.username,
    title: req.body.title,
    options: options,
    votes: votes,
    status: 1
    });
  req.flash('info', '添加成功');
  res.redirec('/vote');
};

exports.view = function(req, res) {
  var id = req.params.id;
  var poll = polls[id-1];
  if (!poll || !poll.status) {
    req.flash('info', '投票不存在');
    return res.redirect('/vote');
  }
  res.render('view', {title:poll.title, poll:poll, user:req.user, message: req.flash('info')});
}

exports.vote = function(req, res) {
  var id = req.params.id;
  var poll = polls[id-1];
  if (!poll || !poll.status) {
    req.flash('info', '投票不存在');
    return res.redirect('/vote');
  }
  var optionsSize = poll.options.length;
  var value = req.body.poll;
  for (var i=0;i<optionsSize;i++) {
    if (poll.options[i]==value) {
      polls[id-1].votes[i]++;
      break;
    }
  }
  req.flash('info', '投票成功');
  res.redirect('/vote/'+id);
}

exports.delete = function(req, res) {
  var id = req.params.id;
  var poll = polls[id-1];
  if (!poll || !poll.status) {
    req.flash('info', '投票不存在');
    return res.redirect('/vote');
  }
  if (req.user.username != poll.username) {
    req.flash('info', '权限不足');
    return res.redirect('/vote');
  }
  polls[id-1].status = 0;
  req.flash('info', '删除成功');
  res.redirect('/vote/');
}