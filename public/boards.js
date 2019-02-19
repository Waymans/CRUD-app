const url = window.location.pathname;
document.getElementById('boardTitle').innerHTML = url.slice(3);
const display = document.getElementById('displayBoards');
const newCard = document.getElementById('newCard');
const err = document.getElementById('errorC');

// list maker
function makerL(data, contain) {
  data.forEach(item => {
    var rand = Math.random().toString(36).substring(2,7);
    let list = document.createElement('div');
      list.setAttribute('class', 'card scale');
      list.setAttribute('id', rand);
    let del = document.createElement('div');
      del.innerHTML = '&times;';
      del.setAttribute('class','times float-right');
    let par = document.createElement('span');
      par.setAttribute('class', 'text');
      par.innerHTML = item;
    list.appendChild(del);
    list.appendChild(par);
    contain.appendChild(list);
    del.addEventListener('click', delList);
  });
}

// card maker
function makerC(data) {
  data.forEach(block => {
    let times = document.createElement('div');
      times.innerHTML = '&times;';
      times.setAttribute('class','times absolute');
      times.setAttribute('id', block.card);
    let card = document.createElement('div');
      card.setAttribute('class', 'card scale');
    let h = document.createElement('h4');
      h.innerHTML = block.card;
    let form = document.createElement('form');
      form.setAttribute('id', block._id);
    let input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('name', 'list');
      input.setAttribute('placeholder', 'Add to list...');
      input.setAttribute('maxlength', '20');
    let contain = document.createElement('div');
      contain.setAttribute('class', 'card-container inline');

    makerL(block.list, contain)
      
    card.appendChild(times);
    card.appendChild(h);
    form.appendChild(input);
    card.appendChild(form);
    card.appendChild(contain);
    display.appendChild(card);
    times.addEventListener('click', handleDelete);
    form.addEventListener('submit', addList)
  }); 
}

//get cards for board page
fetch('/board/'+url.slice(3))
  .then((resp) => resp.json())
  .then(function(data) {
    makerC(data);
  });

//add new card 
newCard.addEventListener('submit', function(e) {
  e.preventDefault();
  let card = e.target[0].value;
  let datas = { card: card }
  let fetchData = { 
    method: 'POST', 
    body: JSON.stringify(datas),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'} } 
  fetch('/board/'+url.slice(3), fetchData)
    .then((resp) => resp.json())
    .then(function(data) { 
      if (data.error) {
        err.innerHTML = data.error;
        newCard.children[0].value = '';
      } else {  
        makerC([data])
        
        err.innerHTML = '';
        newCard.children[0].value = '';
      }
    })
});

// update card - add to list
function addList(e) {
  e.preventDefault();
  var id = e.target.id;
  var text = e.target[0].value;
  let datas = { list: text, id: id }
  console.log(id)
  let fetchData = { 
    method: 'PUT', 
    body: JSON.stringify(datas),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'} } 
  fetch('/board/'+url.slice(3), fetchData)
    .then((resp) => resp.json())
    .then(function(data) {  
      if (data.result) {
        err.innerHTML = data.result 
      } else { 
        let contain = document.createElement('div');
          contain.setAttribute('class', 'card-container inline');
        makerL([data.item], contain);
        let card = document.getElementById(id).parentElement;
        card.appendChild(contain)
        
        document.getElementById(id).firstChild.value = '';
        err.innerHTML = '';
      }
    })
};

// delete card
function handleDelete(e) {
  e.preventDefault();
  var id = e.target.id;
  let item = { card: id }
  let fetchData = { 
    method: 'DELETE', 
    body: JSON.stringify(item),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'} }
  fetch('/board/'+url.slice(3), fetchData)
    .then((resp) => resp.json())
    .then(function(data) {
      for (let i=0; i<display.children.length; i++) {
        display.children[i].firstChild.id === id ? display.removeChild(display.children[i]) : null; 
      }
    
      err.innerHTML = data.deleted;
    });
};

// delete list item
function delList(e) {
  e.preventDefault();
  var id = e.target.parentElement.id;
  var card = e.target.parentElement.parentElement.parentElement.children[1].innerHTML;
  var text = e.target.parentElement.children[1].innerHTML;
  var data = { list: text }
  console.log(card)
  let fetchData = { 
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'} } 
  fetch('/list/'+card, fetchData)
    .then((resp) => resp.json())
    .then(function(data) {  
      var child = document.getElementById(id);
      var parent = child.parentElement;
      parent.removeChild(child);
      err.innerHTML = data.text;
    })
};