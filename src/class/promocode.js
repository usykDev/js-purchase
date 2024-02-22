class Promocode {
	static #list = []
  
	constructor(name, factor) {
	  this.name = name
	  this.factor = factor
	}
  
	static add = (name, factor) => {
	  const newPromoCode = new Promocode(name, factor)
	  Promocode.#list.push(newPromoCode)
	  return newPromoCode
	}
  
	static getByName = (name) => {
	  return this.#list.find((promo) => promo.name === name)
	}
  
	static calc = (promo, price) => {
	  return price * promo.factor
	}
  }

module.exports = {
	Promocode,
}