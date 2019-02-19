const form = document.getElementById('newBoard');
const display = document.getElementById('display');
const err = document.getElementById('error');

function maker(data) {
  data.forEach(data => {
    let card = document.createElement('a');
    card.setAttribute('class', 'card');
    card.setAttribute('draggable', 'true');
    card.setAttribute('ondragstart','drag(event)');
    card.setAttribute('ondragend','end(event)');
    card.setAttribute('id', data._id);
    card.setAttribute('href', '/b/'+data.board);
    card.innerHTML = data.board;
    display.appendChild(card);
  });
}

//get boards for main page
fetch('/boards/')
  .then((resp) => resp.json())
  .then(function(data) {
    maker(data)
  });

//add new board to current list
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (!e.target[0].value) {return err.innerHTML = 'Please submit something.';}
  let board = e.target[0].value;
  let data = { board: board }
  let fetchData = { 
    method: 'POST', 
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'} } 
  fetch('/boards/', fetchData)
    .then((resp) => resp.json())
    .then(function(data) {  
      if (data.error) {
        err.innerHTML = data.error;
        form.children[0].value = '';
      } else {  
        maker([data]);     
        err.innerHTML = '';
        form.children[0].value = '';
      }
    })
});

// DnD
var el;
function allowDrop(e) {
  e.preventDefault();
  }
function end(e) {
  var ids = e.target.id ? ids = e.target.id: null;
  var name = e.target.innerHTML ? name = e.target.innerHTML: null;
  document.getElementById(ids) ? document.getElementById(ids).style.opacity = 1: null;
  e.dataTransfer.setData("Text",ids); 
  e.dataTransfer.setData("Name",name);
}
function drop(e) {
  e.preventDefault();
  var data = e.dataTransfer.getData("Text"); // data = _id
  var board = e.dataTransfer.getData("Name"); // name = board
  var el = document.getElementById(data);
  el.parentNode.removeChild(el);
  let item = { _id: data, board: board }
  let fetchData = { 
    method: 'DELETE', 
    body: JSON.stringify(item),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'} }
  fetch('/boards/', fetchData)
    .then((resp) => resp.json())
    .then(function(data) {
      err.innerHTML = data.deleted;
    });
}
function drag(e) {
  var ids = e.target.id ? ids = e.target.id: null;
  var name = e.target.innerHTML ? name = e.target.innerHTML: null;
  document.getElementById(ids).style.opacity = 0;
  e.dataTransfer.setData("Text",ids);
  e.dataTransfer.setData("Name",name);
}