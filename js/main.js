let eventBus = new Vue()

Vue.component('cart', {
    template: `
        <div>
            <div @click="showCart = !showCart;">cart</div>
            <div v-show="showCart">
                <ul v-if="cart.length">
                    <li>
                        <p>{{cart.length}}</p>
                        <ul>
                            <li>Green: {{green}}</li>
                            <li>Blue: {{blue}}</li>
                        </ul>
                    </li>
                    <li>full price: {{fullPrice}}</li>
                    <li>shipping price: {{shippingCart}}</li>
                </ul>
                <p v-else>your cart is void</p>
            </div>
        </div>    
    `,
    data() {
        return {
            cart: [],
            showCart: false
        }
    },
    computed: {
        green() {
            return this.cart.filter(item => item.variantColor === 'green').length;
        },
        blue() {
            return this.cart.filter(item => item.variantColor === 'blue').length;
        },
        fullPrice() {
            let sum = 0
            for (let item of this.cart) {
                sum += item.variantPrice
            }
            return sum
        },
        shippingCart() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99 * this.cart.length;
            }
        }
    },
    mounted() {
        eventBus.$on('add-to-cart', item => {this.cart.push(item)});
    },
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    }
})

Vue.component('product-tabs', {
    template: `
     <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews">
           <p>{{ review.name }}</p>
           <p>Rating: {{ review.rating }}</p>
           <p>{{ review.review }}</p>
           <p>{{review.recomended }}</p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
       <div v-show="selectedTab === 'Shipping'">
       <p>Shipping: {{ shipping }}</p>
        </div>
        <div v-show="selectedTab === 'Details'">
        <ul>
               <li v-for="detail in details">{{ detail }}</li>
           </ul>
</div>
     </div>
`,


    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    },
    props: {
        reviews: {
            type: Array,
            required: false,
        },
        shipping: {
            type: [String, Number],
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },

})


Vue.component('product-review', {
    template: `

<form class="review-form" @submit.prevent="onSubmit">

<p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>
</p>

 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name">
 </p>

 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review"></textarea>
 </p>

 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
 </p>
 
 <p>
    <label for="recomended">Would you recommend this product?</label>
    <select id="recomended" v-model.number="recomended">
     <option>yes</option>
     <option>no</option>
   </select>
</p>

 <p>
   <input type="submit" value="Submit"> 
 </p>

</form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: [],
            recomended: null,
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recomended: this.recomended,
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recomended = null
                this.errors = []
            } else {
                this.errors = []
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if(!this.recomended) this.errors.push("Recomended required.")
            }
        },
    }
})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
   <div class="product">
   
        <div class="product-image">
           <img :src="image" :alt="altText"/>
       </div>
       

       <div class="product-info">
           <h1>{{ title }} </h1>
           <p v-if="inStock">In stock</p>
           <p v-else>Out of Stock</p>
           <div
                   class="color-box"
                   v-for="(variant, index) in variants"
                   :key="variant.variantId"
                   :style="{ backgroundColor:variant.variantColor }"
                   @mouseover="updateProduct(index)"
           ></div>
          
           <button
                   v-on:click="addToCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Add to cart
           </button>
           <cart class="cart" :premium="premium"></cart>
       </div>   
       <product-tabs :reviews="reviews" :shipping="shipping" :details="details"></product-tabs>           
       </div>
 `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    variantPrice: 10,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0,
                    variantPrice: 10,
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            eventBus.$emit('add-to-cart', this.variants[this.selectedVariant]);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },

    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
            localStorage.setItem('reviews', JSON.stringify(this.reviews));
        })
        savedReviews = localStorage.getItem('reviews');
        if (savedReviews) {
            this.reviews = JSON.parse(localStorage.getItem('reviews'));
        }
    },
})



let app = new Vue({
    el: '#app',
    data: {
        premium: true,
    },
})
