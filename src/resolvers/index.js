const path = require("path");
const fsPromises = require("fs/promises");
const {
  fileExists,
  productDirectory,
  cartDirectory,
  deleteFile,
} = require("../utils/fileHandling");
const { GraphQLError } = require("graphql");
const crypto = require("crypto");

exports.resolvers = {
  Query: {
    getProductById: async (_, args) => {
      const productId = args.productId;

      const productFilePath = path.join(productDirectory, `${productId}.json`);
      const productExists = await fileExists(productFilePath);
      if (!productExists)
        return new GraphQLError("This product does not exist");

      const product = JSON.parse(
        await fsPromises.readFile(productFilePath, {
          encoding: "utf-8",
        })
      );

      return product;
    },
    getShoppingCartById: async (_, args) => {
      const shoppingCartId = args.shoppingCartId;

      const cartFilePath = path.join(cartDirectory, `${shoppingCartId}.json`);
      const cartExists = await fileExists(cartFilePath);
      if (!cartExists)
        return new GraphQLError("This shoppingcart does not exist");

      const cart = JSON.parse(
        await fsPromises.readFile(cartFilePath, {
          encoding: "utf-8",
        })
      );

      return cart;
    },
  },
  Mutation: {
    // If you want to create your own products.
    createProduct: async (_, args) => {
      if (args.articleName.length === 0)
        return new GraphQLError(
          "Product name must be atleast 1 character long"
        );

      const newProduct = {
        articleId: crypto.randomUUID(),
        articleName: args.articleName,
        articlePrice: args.articlePrice,
      };

      let filePath = path.join(
        productDirectory,
        `${newProduct.articleId}.json`
      );

      let idExists = true;
      while (idExists) {
        const exists = await fileExists(filePath);

        if (exists) {
          newProduct.id = crypto.randomUUID();
          filePath = path.join(
            productDirectory,
            `${newProduct.articleId}.json`
          );
        }
        idExists = exists;
      }

      await fsPromises.writeFile(filePath, JSON.stringify(newProduct));

      return newProduct;
    },
    createCart: async (_, args) => {
      const newCart = {
        shoppingCartId: crypto.randomUUID(),
        products: [],
        totalAmount: 0,
      };

      let filePath = path.join(cartDirectory, `${newCart.shoppingCartId}.json`);

      let idExists = true;
      while (idExists) {
        const exists = await fileExists(filePath);

        if (exists) {
          newProduct.id = crypto.randomUUID();
          filePath = path.join(cartDirectory, `${newCart.shoppingCartId}.json`);
        }
        idExists = exists;
      }

      await fsPromises.writeFile(filePath, JSON.stringify(newCart));

      return newCart.shoppingCartId;
    },

    addProductToCart: async (_, args) => {
      const { shoppingCartId, articleId } = args.input;
      const productFilePath = path.join(productDirectory, `${articleId}.json`);
      const productExists = await fileExists(productFilePath);
      if (!productExists)
        return new GraphQLError("This product does not exist");
      const product = JSON.parse(
        await fsPromises.readFile(productFilePath, {
          encoding: "utf-8",
        })
      );

      const cartFilePath = path.join(cartDirectory, `${shoppingCartId}.json`);
      const shoppingCartExists = await fileExists(cartFilePath);
      if (!shoppingCartExists)
        return new GraphQLError("This shoppingcart does not exist");
      let cart = JSON.parse(
        await fsPromises.readFile(cartFilePath, {
          encoding: "utf-8",
        })
      );

      cart.products.push(product);

      let sum = 0;
      for (let i = 0; i < cart.products.length; i++) {
        sum += cart.products[i].articlePrice;
      }
      cart.totalAmount = sum;

      await fsPromises.writeFile(cartFilePath, JSON.stringify(cart));

      return cart;
    },
    removeProductFromCartById: async (_, args) => {
      const { shoppingCartId, articleId } = args.input;

      const cartFilePath = path.join(cartDirectory, `${shoppingCartId}.json`);
      const shoppingCartExists = await fileExists(cartFilePath);
      if (!shoppingCartExists)
        return new GraphQLError("This cart does not exist");
      let cart = JSON.parse(
        await fsPromises.readFile(cartFilePath, {
          encoding: "utf-8",
        })
      );

      let found = false;
      let sum = 0;
      for (let i = 0; i < cart.products.length; i++) {
        if (articleId === cart.products[i].articleId && found === false) {
          cart.products.splice([i], 1);
          found = true;
        }
        sum += cart.products[i].articlePrice;
      }
      cart.totalAmount = sum;

      if (!found)
        return new GraphQLError("This product does not exist in cart");

      await fsPromises.writeFile(cartFilePath, JSON.stringify(cart));

      return cart;
    },
    emptyCartById: async (_, args) => {
      const shoppingCartId = args.shoppingCartId;

      const cartFilePath = path.join(cartDirectory, `${shoppingCartId}.json`);
      const shoppingCartExists = await fileExists(cartFilePath);
      if (!shoppingCartExists)
        return new GraphQLError("This product does not exist");
      let cart = JSON.parse(
        await fsPromises.readFile(cartFilePath, {
          encoding: "utf-8",
        })
      );

      const emptyCart = [];
      cart.products = emptyCart;
      cart.totalAmount = 0;

      await fsPromises.writeFile(cartFilePath, JSON.stringify(cart));

      return cart;
    },
    deleteCartById: async (_, args) => {
      const shoppingCartId = args.shoppingCartId;

      const cartFilePath = path.join(cartDirectory, `${shoppingCartId}.json`);

      const shoppingCartExists = await fileExists(cartFilePath);

      if (!shoppingCartExists)
        return new GraphQLError("Could'nt find the selected ShoppingCart");
      deleteFile(cartFilePath);

      return {
        deletedId: shoppingCartId,
        success: true,
      };
    },
  },
};
