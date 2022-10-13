const productModel = require("../models/productModel");
const AWS = require("../awsfile/aws");
const validation = require("../Util/Validations");

const createProduct = async function (req, res) {
  try {
    let data = req.body;
    let productImage = req.files;

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = data;

    if (productImage && productImage.length > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      //let uploadedFileURL= await uploadFile( files[0] )
      var uploadedProfilePictureUrl = await AWS.uploadFile(productImage[0]);
      //res.status(201).send({msg: "file uploaded succesfully", data: uploadedProfilePictureUrl  })
    } else {
      res.status(400).send({ msg: "No file found" });
    }
    const productData = {
      title: title,
      description: description,
      price: price,
      currencyId: currencyId,
      currencyFormat: currencyFormat,
      isFreeShipping: isFreeShipping,
      productImage: uploadedProfilePictureUrl, // s3 link
      style: style,
      availableSizes: availableSizes,
      installments: installments,
    };
    let product = await productModel.create(productData);
    return res.status(201).send({
      status: true,
      message: "Product Successfully created",
      data: product,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// const getProduct = async function(req, res){
//     try {
//         let filters = req.query
//         let userId = filters.userId
//         // ======================================= User Id validation ======================================
//         if (userId) {
//             if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "please enter valid user id " })
//         }

//         let getProducts = await productModel.find({ isDeleted: false, ...filters }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

//         if (getProducts.length == 0) return res.status(404).send({ status: false, message: "product not found" })

//         // =========================================== Sorting title in A-Z order ========================================

//         let sortProducts = getProducts.sort((a, b) => a.title.localeCompare(b.title))

//         return res.status(200).send({ status: true, message: "Book list", data: sortProducts })

//     } catch (err) {
//         res.status(500).send({ status: false, message: err.message })
//     }
// }

const getProduct = async function (req, res) {
  try {
    let filter = req.query;
    let query = { isDeleted: false };
    if (filter) {
      const { name, description, isFreeShipping, style, size, installments,price } =
        filter;

      let nameIncludes = new RegExp(`${filter.name}`);
      
      if(price){
        query.price = price
      }

      if (name) {
        query.title = nameIncludes;
      }
      if (description) {
        query.description = description.trim();
      }
      if (isFreeShipping) {
        query.isFreeShipping = isFreeShipping;
      }
      if (style) {
        query.style = style.trim();
      }
      if (installments) {
        query.installments = installments;
      }
      if (size) {
        const sizeArr = size
          .trim()
          .split(",")
          .map((x) => x.trim());
        query.availableSizes = { $all: sizeArr };
      }
    }

  if(filter.price){

   query.price ={ $gt:Number(priceGreaterThan)}
   
  }else if(filter.price){
    query.price =  {$gt:Number(priceLessThan)}
  }else if(filter.priceGreaterThan && filter.priceLessThan){
   query.price = { $gt:Number(priceGreaterThan), $gt:Number(priceLessThan)}
  }


    let data = await productModel
      .find({ ...query })
      .sort({ price: filter.priceSort });

    if (data.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "No data Found!!!" });
    }

    return res
      .status(200)
      .send({
        status: true,
        message: "Success",
        count: data.length,
        data: data,
      });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

const getProductById = async function (req, res) {
  try {
    let productId = req.params.productId;

    if (!validation.isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: `${productId} not a valid productId` });
    }

    let productById = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!productById) {
      return res
        .status(404)
        .send({
          status: false,
          message: `We can't find any product by this id....${productId}`,
        });
    }
    return res
      .status(200)
      .send({ status: true, message: "success", data: productById });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = { createProduct, getProduct, getProductById };
