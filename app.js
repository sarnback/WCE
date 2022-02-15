//variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
// cart
let cart = [];
//buttons
let buttonsDOM = [];

//getting products
class Product {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
//display returned products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      //för inte ovverida +=
      //adding products dynamicly
      result += `
        
<!-- single product -->
    <article class="product">
      <div class="img-container">
        <img src=${product.image} alt="product" class="product-img">
        <button class="bag-btn" data-id=${product.id}>
          <i class="fas fa-shopping-cart"></i>
          lägg i kundkorg
        </button>
      </div>
      <h3>${product.title}</h3>
      <h4>${product.price}kr</h4>
    </article>
    <!-- /single product -->

        `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    //spread operator ...
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      //callback func, if item id matching button id
      let inCart = cart.find((item) => item.id === id);
      //if item is in cart
      if (inCart) {
        button.innerText = "I Kundkorg";
        //disable button
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "I Kundkorg";
        event.target.disabled = true;
        //get product from products
        let cartItem = { ...Storage.getProducts(id), amount: 1 };
        //add product to cart
        cart = [...cart, cartItem];
        //save cart in storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }
  //Adding total price to cart looping with map
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    //floats price to 2 decimals
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  //create div and adding cart items styled from css
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
  <img src=${item.image} alt="product">
          <div>
            <h4>${item.title}</h4>
            <h5>${item.price}kr</h5>
            <span class="remove-item" data-id =${item.id}>ta bort produkt</span>
          </div>
          <div>
            <i class="fas fa-chevron-up" data-id =${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id =${item.id}></i>
          </div>`;
    //method of the Node interface adds a node to the end of the list of children of a specified parent node
    //adding whole item-cart div
    cartContent.appendChild(div);
  }
  //Shows cart
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  //check when loading webpage if cart empty or not
  setupAP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  //method with cart array, every item in cart will be added to cartnumber
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  //hides cart
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    //claer cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //Cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        //remove individual item
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        //updating cart
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        }
        //if item lower than 0 remove item from cart
        else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  //clear items from cart array with foreach item find item itd and remove
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    //update cart value
    this.setCartValues(cart);
    Storage.saveCart(cart);
    //reseting button and icon
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>lägg i kundkorg`;
  }
  //to reset buttons to original state for e.x reseting cart
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  //get products based on id from localStorage
  static getProducts(id) {
    //returns array
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  //check if cart is empty or not when opening page, otherwise cart has same items as before
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Product();
  //setup app
  ui.setupAP();
  //get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
      //adding to cart
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
