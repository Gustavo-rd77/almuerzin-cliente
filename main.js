

let allMeals = [];
let ruta = 'login';
let user;
const stringToHTML = (s)=>{
    const parser = new DOMParser();
    const doc = parser.parseFromString(s,'text/html');
    return doc.body.firstChild
}
const renderItem = (item)=>{
    const element =  stringToHTML( `<li data-id="${item._id}">${item.name}</li>`);
    element.addEventListener('click',()=>{ 
        const li_clas = document.querySelectorAll('.selected');
        if(li_clas.length != 0 ){
            li_clas.forEach(li =>{
                li.classList.remove('selected')
            })
        }
        element.classList.add('selected');
        const meal_id = document.getElementById("meal-id");
        meal_id.value = item._id;
    })
    return element;
}

const renderOrder = (order,meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id);
    const element =  stringToHTML( `<li data-id="${order._id}">${meal.name} - ${order.user_id}</li>`);
    return element;
}






const inicializaFormulario = () => {
    const submit = document.getElementById('submit');
    const orderForm = document.getElementById('order-form');
    const order_list = document.getElementById('orders-list');
    orderForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        const meal_id = document.getElementById("meal-id");
        const mealValue = meal_id.value;
        if(!mealValue){
            alert("selecciona una orden");
            submit.removeAttribute('disabled');
            return
        }
        submit.setAttribute('disabled','');
        const order = {
             meal_id: mealValue,
             user_id: user._id
        }
        const token = localStorage.getItem('token');
        if(token){


            fetch('https://serverless-gusstav-77.vercel.app/api/orders',{
                method:'POST',
                headers:{
                    'Content-Type' : 'application/json',
                    authorization: token
                },
                body: JSON.stringify(order)
            })
            .then(res => res.json())
            .then(resObj => {
               const item = renderOrder(resObj,allMeals);
               order_list.appendChild(item);
               submit.removeAttribute('disabled');
            });

        }


          

    });
    
}

const inicializaDatos = () => {
    const meal_list = document.getElementById('meals-list');
    fetch('https://serverless-gusstav-77.vercel.app/api/meals')
    .then(response => response.json()) //para convertirlo en JSON entrante en un objeto de javascript
    .then(data => {
        allMeals = data;
        const listItem = data.map(renderItem);
        listItem.forEach(element => {
            meal_list.appendChild(element);
        });
       meal_list.removeChild(meal_list.firstElementChild);
       submit.removeAttribute('disabled');
       fetch('https://serverless-gusstav-77.vercel.app/api/orders',{
           method:'GET'
       })
           .then(response => response.json())
           .then(orderData => {
           const orderList = document.getElementById('orders-list');
           const listItem = orderData.map(order => renderOrder(order,data));
           listItem.forEach(element => orderList.appendChild(element));
           orderList.removeChild(orderList.firstElementChild);
           
           } )
    })
}

const renderApp = () => {
    const token = localStorage.getItem('token');
    if(token){
        user = JSON.parse(localStorage.getItem('user'));
        return renderOrders();
    }
    renderLogin()

}

const renderOrders = () => {
      const ordersView = document.getElementById('orders-view')
      document.getElementById('app').innerHTML = ordersView.innerHTML;
      inicializaFormulario()
      inicializaDatos()
      const btnLogout = document.getElementById('logout');
      btnLogout.addEventListener('click',()=>{
          const btnLogout = document.getElementById('logout');
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          renderApp();
      })
}

const renderLogin = () =>{
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML
    const form_login = document.getElementById('form-login');
    const btnRegister = document.getElementById('register');
    btnRegister.addEventListener('click',()=>{
        renderRegister();
    })



    form_login.addEventListener('submit',(e)=>{
        e.preventDefault();
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    fetch('https://serverless-gusstav-77.vercel.app/api/auth/login',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email: email ,password: password})
    }).then(x => x.json())
      .then(respuesta => {
          localStorage.setItem('token',respuesta.token);
          ruta = 'orders'
          return respuesta.token
      })
      .then(token => {
          fetch('https://serverless-gusstav-77.vercel.app/api/auth/me',{
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  authorization: token
              },
          })
          .then(x => x.json())
          .then(fetchedUser => {
              localStorage.setItem('user',JSON.stringify(fetchedUser))
              user = fetchedUser
              renderOrders() 
          })
      })
        
    })


}

const renderRegister = () => {
    const registerTemplate = document.getElementById('register-template')
    document.getElementById('app').innerHTML = registerTemplate.innerHTML
    const form_register = document.getElementById('form-register');

    form_register.addEventListener('submit',(e)=>{
        e.preventDefault();
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const dataRegister = {email, password}
        fetch('https://serverless-gusstav-77.vercel.app/api/auth/register',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataRegister)  
        })
        .then(x => x.text())
        .then(res => {
            alert(res)
            renderApp()
        })

        
        
    })
}


window.onload = ()=>{
  
    

    renderApp();

    


}