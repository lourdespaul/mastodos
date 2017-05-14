
Todos = new Mongo.Collection('todos');

if(Meteor.isClient){
  Meteor.subscribe('todos');
  Template.main.helpers({
    todos: function(){
      return Todos.find({},{sort:{createdAt:-1}});
    }
  });
  Template.main.events({
    'submit .new-todo': function(event){
      const text = event.target.text.value;

      Meteor.call('addTodo', text);

      event.target.text.value='';

      return false;
    },

    'click .toggle-checked': function(){
      Meteor.call('setChecked', this._id, !this.checked);
    },

    'click .delete-todo':function(){
      if(confirm('Are you sure?')){
        Meteor.call('deleteTodo', this._id);
      }
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if(Meteor.isServer){
  Meteor.publish('todos', function(){
    if(!this.userId){
      return null;
    }
    return Todos.find({userId:this.userId});
  })
}

Meteor.methods({

  addTodo: function(text){
    if(!Meteor.userId){
      throw new Meteor.Error('not-authorized')
    }
    Todos.insert({
      text: text,
      createdAt: new Date(),
      userId: Meteor.userId(),
      username: Meteor.user().username,
    });
  },

  setChecked: function(todoId, setChecked){
    if(!Meteor.userId()){
      throw new Meteor.Error('not-authorized')
    }
    let todo = Todos.findOne(todoId);
    if(todo.userId !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }
    Todos.update(todoId,{$set:{checked: setChecked}});
  },

  deleteTodo: function(todoId){
    if(!Meteor.userId()){
      throw new Meteor.Error('not-authorized')
    }
    let todo = Todos.findOne(todoId);
    if(todo.userId != Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }
    Todos.remove(todoId);
  }

});
