const express = require('express')
const router = express.Router()

const { Product } = require('../class/product')
const { Purchase } = require('../class/purchase')
const { Promocode } = require('../class/promocode')

Product.add(
  '/img/jupiter.png',
  `Jupiter One 537 Custom Gaming PC Build`,
  `Windows 11, Intel Core i3, 16 GB, Gigabyte GeForce RTX 3050 Windforce OC 8GB`,
  [{ id: 2, text: 'Top sales' }],
  999,
  10,
)

Product.add(
  '/img/workstation.png',
  `HP Z2 G9 Workstation Tower ( 5F0P5EA ) with Intel®`,
  `Windows 11 Pro, Intel Core i7, 16 GB, Quadro T1000 8GB
  `,
  [{ id: 1, text: 'Ready for shipping' }],
  1779,
  10,
)

Product.add(
  '/img/proone.png',
  `HP All-In-One ProOne 440 G9 PC (885J9EA)`,
  `Windows 11 Pro, Intel® Core™ i5-12500T, 8 GB, Intel® UHD Graphics 770`,
  [{ id: 1, text: 'Ready for shipping' }],
  1059,
  10,
)

Product.add(
  '/img/elitedesk.png',
  `HP EliteDesk 800 G3 USFF USED Premium Quality`,
  `Windows 10 Pro, Intel Core i5, 8 GB, Intel® HD Graphics 530`,
  [
    { id: 1, text: 'Ready for shipping' },
    { id: 2, text: 'Top sales' },
  ],
  206,
  10,
)

Product.add(
  '/img/bundle.png',
  `Bundle HP PC Pro 290 G9 & HP Monitor E24 G5 24"`,
  `Windows 11 Pro, Intel Core i5, 16 GB, Intel® UHD Graphics 730`,
  [
    { id: 1, text: 'Ready for shipping' },
    { id: 2, text: 'Top sales' },
  ],
  958,
  10,
)

Product.add(
  '/img/omen.png',
  `HP OMEN 40L Desktop GT21-1006nv Gaming PC ( 7Z504EA )`,
  `Windows 11, AMD Ryzen™ 7, 32 GB, NVIDIA® GeForce RTX™ 3070 Ti 8GB`,
  [
    { id: 1, text: 'Ready for shipping' },
    { id: 2, text: 'Top sales' },
  ],
  2669,
  10,
)

Product.add(
  '/img/lenovo.png',
  `Lenovo PC ThinkCentre neo 50q G4 Tiny SFF`,
  `Windows 11 Pro, Intel Core i5, 16 GB, Intel UHD Graphics 730`,
  [{ id: 1, text: 'Top sales' }],
  760,
  10,
)

Product.add(
  '/img/ideacentre.png',
  `Lenovo IdeaCentre AIO 3 PC 21.5"`,
  `Windows 11, AMD Ryzen™ 3 3250U, 8 GB, AMD Radeon™ Graphics`,
  [{ id: 1, text: 'Ready for shipping' }],
  499,
  10,
)

Promocode.add('SUMMER2023', 0.9)
Promocode.add('DISCOUNT50', 0.5)
Promocode.add('SALE25', 0.75)

// ================================================================

router.get('/', function (req, res) {
  res.render('purchase-index', {
    name: 'purchase-index',

    component: ['index-products'],

    data: {
      list: Product.getList(),
    },
  })
})

// ================================================================

router.get('/purchase-product', function (req, res) {
  const id = Number(req.query.id)

  res.render('purchase-product', {
    name: 'purchase-product',

    data: {
      list: Product.getRandomList(id),
      product: Product.getById(id),
    },
  })
})

// ================================================================

router.post('/purchase-create', function (req, res) {
  const id = Number(req.query.id)
  const amount = Number(req.body.amount)

  if (amount < 1) {
    return res.render('alert', {
      name: 'alert',
      data: {
        message: 'Error',
        info: 'Incorrect number of items',
        link: `/purchase-product?id=${id}`,
      },
    })
  }

  const product = Product.getById(id)

  if (product.amount < 1) {
    return res.render('alert', {
      name: 'alert',
      data: {
        message: 'Error',
        info: 'This number of items is not available',
        link: `/purchase-product?id=${id}`,
      },
    })
  }

  console.log(product, amount)

  const productPrice = product.price * amount
  const totalPrice = productPrice + Purchase.DELIVERY_PRICE
  const bonus = Purchase.calcBonusAmount(totalPrice)

  res.render('purchase-create', {
    name: 'purchase-create',

    component: ['heading-dark'],

    data: {
      id: product.id,

      cart: [
        {
          text: `${product.title} (${amount} pcs)`,
          price: productPrice,
        },
        {
          text: `Delivery`,
          price: Purchase.DELIVERY_PRICE,
        },
      ],
      totalPrice,
      productPrice,
      deliveryPrice: Purchase.DELIVERY_PRICE,
      amount,
      bonus,
    },
  })

  res.render('purchase-product', {
    name: 'purchase-product',

    data: {
      list: Product.getRandomList(id),
      product: Product.getById(id),
    },
  })
})

// ================================================================

router.post('/purchase-submit', function (req, res) {
  const id = Number(req.query.id)

  let {
    totalPrice,
    productPrice,
    deliveryPrice,
    amount,

    firstname,
    lastname,
    email,
    phone,
    comment,

    promocode,
    bonus,
  } = req.body

  const product = Product.getById(id)

  if (!product) {
    return res.render('alert', {
      name: 'alert',

      data: {
        message: 'Error',
        info: 'Item not found',
        link: `/purchase-list`,
      },
    })
  }

  if (product.amount < amount) {
    return res.render('alert', {
      name: 'alert',

      data: {
        message: 'Error',
        info: 'This number of items is not available',
        link: `/purchase-list`,
      },
    })
  }

  totalPrice = Number(totalPrice)
  productPrice = Number(productPrice)
  deliveryPrice = Number(deliveryPrice)
  amount = Number(amount)
  bonus = Number(bonus)

  if (
    isNaN(totalPrice) ||
    isNaN(productPrice) ||
    isNaN(deliveryPrice) ||
    isNaN(amount) ||
    isNaN(bonus)
  ) {
    return res.render('alert', {
      name: 'alert',

      data: {
        message: 'Error',
        info: 'The data is incorrect',
        link: `/purchase-list`,
      },
    })
  }

  if (!firstname || !lastname || !email || !phone) {
    return res.render('alert', {
      name: 'alert',

      data: {
        message: `Fill in the required fields`,
        info: 'The data is incorrect',
        link: `/purchase-list`,
      },
    })
  }

  if (bonus || bonus > 0) {
    const bonusAmount = Purchase.getBonusBalance(email)

    console.log(bonusAmount)

    if (bonus > bonusAmount) {
      bonus = bonusAmount
    }

    Purchase.updateBonusBalance(email, totalPrice, bonus)

    totalPrice -= bonus
  } else {
    Purchase.updateBonusBalance(email, totalPrice, 0)
  }

  if (promocode) {
    promocode = Promocode.getByName(promocode)

    if (promocode) {
      totalPrice = Promocode.calc(promocode, totalPrice)
    }
  }

  if (totalPrice < 0) totalPrice = 0

  const purchase = Purchase.add(
    {
      totalPrice,
      productPrice,
      deliveryPrice,
      amount,
      bonus,

      firstname,
      lastname,
      email,
      phone,

      promocode,
      comment,
    },
    product,
  )

  console.log(purchase)

  res.render('alert', {
    name: 'alert',

    data: {
      message: 'Success',
      info: 'The order has been created',
      link: `/purchase-list`,
    },
  })
})

// ================================================================

router.get('/purchase-list', function (req, res) {
  const list = Purchase.getList()
  res.render('purchase-list', {
    name: 'purchase-list',

    data: {
      purchases: {
        list,
      },
    },
  })
})

// ================================================================

router.get('/purchase-info', function (req, res) {
  const id = Number(req.query.id)
  const purchase = Purchase.getById(id)

  const bonus = Purchase.calcBonusAmount(
    purchase.totalPrice,
  )

  console.log(purchase)

  res.render('purchase-info', {
    name: 'purchase-info',

    component: ['heading-dark'],

    data: {
      id: purchase.id,
      firstname: purchase.firstname,
      lastname: purchase.lastname,
      phone: purchase.phone,
      email: purchase.email,
      comment: purchase.comment,
      product: purchase.product,
      productPrice: purchase.productPrice,
      deliveryPrice: purchase.deliveryPrice,
      totalPrice: purchase.totalPrice,
      bonus: bonus,
    },
  })
})

// ================================================================

router.get('/purchase-update', function (req, res) {
  const id = Number(req.query.id)

  const purchase = Purchase.getById(id)

  if (!purchase) {
    return res.render('alert', {
      name: 'alert',
      data: {
        message: 'Error',
        info: 'Order not found',
        link: '/purchase-list',
      },
    })
  }

  res.render('purchase-update', {
    name: 'purchase-update',
    component: ['heading-dark'],
    data: {
      id: purchase.id,
      firstname: purchase.firstname,
      lastname: purchase.lastname,
      email: purchase.email,
      phone: purchase.phone,
      comment: purchase.comment,
      amount: purchase.amount,
    },
  })
})

router.post('/purchase-update', function (req, res) {
  const id = Number(req.query.id)

  const purchase = Purchase.getById(id)

  if (!purchase) {
    return res.render('alert', {
      name: 'alert',
      data: {
        message: 'Error',
        info: 'Order not found',
        link: '/purchase-list',
      },
    })
  }

  const data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    phone: req.body.phone,
  }

  const isUpdated = Purchase.updateById(id, data)

  if (isUpdated) {
    res.render('alert', {
      name: 'alert',
      data: {
        message: 'Success',
        info: 'Data updated',
        link: `/purchase-info?id=${id}`,
      },
    })
  } else {
    res.render('alert', {
      name: 'alert',
      data: {
        message: 'Error',
        info: 'The order was not found or the data are incorrect',
        link: '/purchase-list',
      },
    })
  }
})

module.exports = router
