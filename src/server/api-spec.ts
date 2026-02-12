
/**
 * This file serves as documentation for the backend API that needs to be implemented.
 * In a real project, this would be implemented on the server side using a technology
 * like Node.js/Express, Ruby on Rails, Django, etc.
 */

/**
 * Authentication Endpoints
 */
export const authEndpoints = {
  // POST /api/auth/login
  login: {
    method: 'POST',
    path: '/api/auth/login',
    body: {
      email: 'string',
      password: 'string'
    },
    response: {
      success: 'boolean',
      user: {
        id: 'string',
        name: 'string',
        email: 'string',
        role: 'string',
      },
      token: 'string'
    }
  },
  
  // POST /api/auth/register
  register: {
    method: 'POST',
    path: '/api/auth/register',
    body: {
      name: 'string',
      email: 'string',
      password: 'string'
    },
    response: {
      success: 'boolean',
      user: {
        id: 'string',
        name: 'string',
        email: 'string',
        role: 'string',
      },
      token: 'string'
    }
  },
  
  // POST /api/auth/forgot-password
  forgotPassword: {
    method: 'POST',
    path: '/api/auth/forgot-password',
    body: {
      email: 'string'
    },
    response: {
      success: 'boolean',
      message: 'string'
    }
  },
  
  // POST /api/auth/reset-password
  resetPassword: {
    method: 'POST',
    path: '/api/auth/reset-password',
    body: {
      token: 'string',
      password: 'string'
    },
    response: {
      success: 'boolean',
      message: 'string'
    }
  }
};

/**
 * User Endpoints
 */
export const userEndpoints = {
  // GET /api/users/profile
  getProfile: {
    method: 'GET',
    path: '/api/users/profile',
    headers: {
      authorization: 'Bearer {token}'
    },
    response: {
      id: 'string',
      name: 'string',
      email: 'string',
      role: 'string',
      createdAt: 'string',
    }
  },
  
  // PUT /api/users/profile
  updateProfile: {
    method: 'PUT',
    path: '/api/users/profile',
    headers: {
      authorization: 'Bearer {token}'
    },
    body: {
      name: 'string',
      email: 'string',
      password: 'string (optional)'
    },
    response: {
      success: 'boolean',
      user: {
        id: 'string',
        name: 'string',
        email: 'string',
        role: 'string',
        updatedAt: 'string'
      }
    }
  },
  
  // GET /api/users/address
  getAddresses: {
    method: 'GET',
    path: '/api/users/address',
    headers: {
      authorization: 'Bearer {token}'
    },
    response: [
      {
        id: 'string',
        name: 'string',
        street: 'string',
        city: 'string',
        state: 'string',
        zipCode: 'string',
        country: 'string',
        isDefault: 'boolean'
      }
    ]
  },
  
  // POST /api/users/address
  addAddress: {
    method: 'POST',
    path: '/api/users/address',
    headers: {
      authorization: 'Bearer {token}'
    },
    body: {
      name: 'string',
      street: 'string',
      city: 'string',
      state: 'string',
      zipCode: 'string',
      country: 'string',
      isDefault: 'boolean'
    },
    response: {
      success: 'boolean',
      address: {
        id: 'string',
        name: 'string',
        street: 'string',
        city: 'string',
        state: 'string',
        zipCode: 'string',
        country: 'string',
        isDefault: 'boolean'
      }
    }
  }
};

/**
 * Product Endpoints
 */
export const productEndpoints = {
  // GET /api/products
  getProducts: {
    method: 'GET',
    path: '/api/products',
    query: {
      category: 'string (optional)',
      search: 'string (optional)',
      sort: 'string (optional)',
      page: 'number (optional)',
      limit: 'number (optional)'
    },
    response: {
      products: [
        {
          id: 'string',
          name: 'string',
          description: 'string',
          price: 'number',
          category: 'string',
          image: 'string',
          stock: 'number',
          createdAt: 'string'
        }
      ],
      totalCount: 'number',
      totalPages: 'number',
      currentPage: 'number'
    }
  },
  
  // GET /api/products/:id
  getProduct: {
    method: 'GET',
    path: '/api/products/:id',
    response: {
      id: 'string',
      name: 'string',
      description: 'string',
      price: 'number',
      category: 'string',
      image: 'string',
      images: 'string[]',
      stock: 'number',
      features: 'string[]',
      specifications: 'object',
      relatedProducts: 'string[]',
      createdAt: 'string',
      updatedAt: 'string'
    }
  },
  
  // Admin: POST /api/products
  createProduct: {
    method: 'POST',
    path: '/api/products',
    headers: {
      authorization: 'Bearer {token}'
    },
    body: {
      name: 'string',
      description: 'string',
      price: 'number',
      category: 'string',
      image: 'string',
      images: 'string[]',
      stock: 'number',
      features: 'string[]',
      specifications: 'object'
    },
    response: {
      success: 'boolean',
      product: {
        id: 'string',
        name: 'string',
        description: 'string',
        price: 'number',
        category: 'string',
        image: 'string',
        images: 'string[]',
        stock: 'number',
        features: 'string[]',
        specifications: 'object',
        createdAt: 'string'
      }
    }
  }
};

/**
 * Order Endpoints
 */
export const orderEndpoints = {
  // POST /api/orders
  createOrder: {
    method: 'POST',
    path: '/api/orders',
    headers: {
      authorization: 'Bearer {token}'
    },
    body: {
      items: [
        {
          productId: 'string',
          quantity: 'number',
          price: 'number'
        }
      ],
      shippingAddress: {
        name: 'string',
        street: 'string',
        city: 'string',
        state: 'string',
        zipCode: 'string',
        country: 'string'
      },
      paymentMethod: 'string',
      deliveryTime: 'string',
      subtotal: 'number',
      shipping: 'number',
      total: 'number'
    },
    response: {
      success: 'boolean',
      order: {
        id: 'string',
        status: 'string',
        items: [
          {
            productId: 'string',
            name: 'string',
            quantity: 'number',
            price: 'number'
          }
        ],
        shippingAddress: 'object',
        paymentMethod: 'string',
        deliveryTime: 'string',
        subtotal: 'number',
        shipping: 'number',
        total: 'number',
        createdAt: 'string'
      },
      paymentIntentId: 'string (if payment required)'
    }
  },
  
  // GET /api/orders
  getOrders: {
    method: 'GET',
    path: '/api/orders',
    headers: {
      authorization: 'Bearer {token}'
    },
    response: [
      {
        id: 'string',
        status: 'string',
        items: [
          {
            productId: 'string',
            name: 'string',
            quantity: 'number',
            price: 'number'
          }
        ],
        total: 'number',
        createdAt: 'string'
      }
    ]
  },
  
  // GET /api/orders/:id
  getOrder: {
    method: 'GET',
    path: '/api/orders/:id',
    headers: {
      authorization: 'Bearer {token}'
    },
    response: {
      id: 'string',
      status: 'string',
      items: [
        {
          productId: 'string',
          name: 'string',
          quantity: 'number',
          price: 'number',
          image: 'string'
        }
      ],
      shippingAddress: 'object',
      paymentMethod: 'string',
      deliveryTime: 'string',
      subtotal: 'number',
      shipping: 'number',
      total: 'number',
      createdAt: 'string',
      updatedAt: 'string',
      paymentStatus: 'string',
      trackingInfo: 'object (if available)'
    }
  }
};

/**
 * Payment Endpoints
 */
export const paymentEndpoints = {
  // POST /api/payments/intent
  createPaymentIntent: {
    method: 'POST',
    path: '/api/payments/intent',
    headers: {
      authorization: 'Bearer {token}'
    },
    body: {
      orderId: 'string',
      amount: 'number',
      currency: 'string'
    },
    response: {
      clientSecret: 'string',
      amount: 'number',
      currency: 'string'
    }
  },
  
  // POST /api/payments/confirm
  confirmPayment: {
    method: 'POST',
    path: '/api/payments/confirm',
    headers: {
      authorization: 'Bearer {token}'
    },
    body: {
      paymentIntentId: 'string',
      orderId: 'string'
    },
    response: {
      success: 'boolean',
      order: {
        id: 'string',
        status: 'string',
        paymentStatus: 'string',
        updatedAt: 'string'
      }
    }
  }
};

/**
 * Admin Endpoints
 */
export const adminEndpoints = {
  // GET /api/admin/dashboard
  getDashboardStats: {
    method: 'GET',
    path: '/api/admin/dashboard',
    headers: {
      authorization: 'Bearer {token}'
    },
    response: {
      totalOrders: 'number',
      totalSales: 'number',
      totalCustomers: 'number',
      totalProducts: 'number',
      recentOrders: [
        {
          id: 'string',
          customer: 'string',
          total: 'number',
          status: 'string',
          createdAt: 'string'
        }
      ],
      salesOverTime: [
        {
          date: 'string',
          sales: 'number'
        }
      ],
      productInventory: [
        {
          id: 'string',
          name: 'string',
          stock: 'number',
          category: 'string'
        }
      ]
    }
  },
  
  // GET /api/admin/users
  getUsers: {
    method: 'GET',
    path: '/api/admin/users',
    headers: {
      authorization: 'Bearer {token}'
    },
    query: {
      search: 'string (optional)',
      page: 'number (optional)',
      limit: 'number (optional)'
    },
    response: {
      users: [
        {
          id: 'string',
          name: 'string',
          email: 'string',
          role: 'string',
          createdAt: 'string',
          lastLogin: 'string',
          ordersCount: 'number'
        }
      ],
      totalCount: 'number',
      totalPages: 'number',
      currentPage: 'number'
    }
  },
  
  // PUT /api/admin/orders/:id
  updateOrderStatus: {
    method: 'PUT',
    path: '/api/admin/orders/:id',
    headers: {
      authorization: 'Bearer {token}'
    },
    body: {
      status: 'string',
      trackingInfo: 'object (optional)'
    },
    response: {
      success: 'boolean',
      order: {
        id: 'string',
        status: 'string',
        updatedAt: 'string'
      }
    }
  }
};
