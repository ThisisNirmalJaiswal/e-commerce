const productModel = require("../models/productModel");
const AWS = require("../awsfile/aws");
const validation = require("../Util/Validations");


//---------------------------create Products-----------------------------------

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

//-------------------------getProduct---------------------

const getProduct = async function (req, res) {
  try {
    let filter = req.query;
    let query = { isDeleted: false };

    const { name, description, isFreeShipping, style, availableSizes, installments, priceGreaterThan, priceLessThan } =
      filter;

    let nameIncludes = RegExp(`${filter.name}`);



    if (name) {
      query.title = nameIncludes;
    }
    if (description) {
      query.description = description.trim();
    }
    if (isFreeShipping) {
      if(isFreeShipping=="false");


      query.isFreeShipping = (!Boolean(isFreeShipping))

      
      query.isFreeShipping = isFreeShipping;
    }
    if (style) {
      query.style = style.trim();
    }
    if (installments) {
      query.installments = installments;
    }
    if (availableSizes) {

      

      const sizeArr = availableSizes
        .split(",")
        .map((x) => x.trim());

      query.availableSizes = { $all: sizeArr };
    }

    if (filter.priceGreaterThan && filter.priceLessThan) {
      query.price = { $gt: Number(priceGreaterThan), $lt: Number(priceLessThan) }
    }
    else if (filter.priceGreaterThan) {
      
      query.price = { $gt: Number(priceGreaterThan) }
    } else if (filter.priceLessThan) {
      query.price = { $lt: Number(priceLessThan) }
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
//--------------------------------getProductById-------------------------

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

//--------------------------------DeleteAPI-------------------------

const deleteProductById = async function (req, res) {
  try {
    let productId = req.params.productId

    // productId validation
    if (!validation.isValidObjectId(productId))
      return res.status(400).send({ status: false, message: "Invalid productId" });


    let savedData = await productModel.findById(productId);

    //if it is already deleted
    if (savedData.isDeleted)
      return res.status(404).send({
        status: false,
        message: "Product not found",
      });

    // updating book.
    let deleteProduct = await productModel.findByIdAndUpdate(
      savedData,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: "Product deleted successfully", data: deleteProduct });

  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

//_________________________________Updateproduct______________________________________________________________


const updateProduct = async function (req, res) {
try {
  let requestBody = req.body;

  let filter = {isDeleted:false};

  let { title,
    description, 
    price, 
    currencyId, 
    currencyFormat, 
    isFreeShipping, 
     style, 
    availableSizes, 
    installments  } = requestBody;

    if (req.files) {
      let productImage = req.files

      if (productImage != undefined && productImage.length > 0) {

        var updatedProductPictureUrl = await AWS.uploadFile(productImage[0]);

      }

      filter.productImage = updatedProductPictureUrl;
    }

    if (title) {

      if (validation.isValid(title))
        return res.status(400).send({
          status: false,
          message: "title can't be empty",
        });

      if (!validation.isValidString(title.trim()))
        return res.status(400).send({
          status: false,
          message: "title must be a string",
        });

      filter.title = title
    }

    if (description) {

      if (validation.isValid(description))
        return res.status(400).send({
          status: false,
          message: "description can't be empty",
        });

      if (!validation.isValidString(description.trim()))
        return res.status(400).send({
          status: false,
          message: "description must be a string",
        });

      filter.description = description
    }

    if (price) {

      if (!validation.isValidPrice(price))
        return res.status(400).send({
          status: false,
          message: "Price is invalid",
        });

      

      filter.price = price
    }

    if (currencyId) {

      if (validation.isValid(currencyId))
      return res.status(400).send({
        status: false,
        message: "currencyId can't be empty",
      });

      if (!validation.isValidString(currencyId.trim()))
      return res.status(400).send({
        status: false,
        message: "currencyId must be a string",
      });

      filter.currencyId = currencyId
    }

    if (currencyFormat) {

      if (validation.isValid(currencyFormat))
      return res.status(400).send({
        status: false,
        message: "currencyFormat can't be empty",
      });

      if (!validation.isValidString(currencyFormat.trim()))
      return res.status(400).send({
        status: false,
        message: "currencyFormat must be a string",
      });

      filter.currencyFormat = currencyFormat
    }

     if(isFreeShipping){

      if((isFreeShipping!="false") || (isFreeShipping!="false"))
      return res.status(400).send({
        status: false,
        message: "isFreeShipping must be either true or false",
      });

       
     if(isFreeShipping=="false"){
      filter.isFreeShipping = (!Boolean(isFreeShipping))

     }
      if(isFreeShipping=="true");{
        filter.isFreeShipping = (Boolean(isFreeShipping))
      }
     }

     if (style) {

      if (validation.isValid(style))
        return res.status(400).send({
          status: false,
          message: "style can't be empty",
        });

      if (!validation.isValidString(style.trim()))
        return res.status(400).send({
          status: false,
          message: "style must be a string",
        });

      filter.style = style
    }

    if(availableSizes){
           const sizeArr = availableSizes
          .split(",")
          .map((x) => x.trim());

        query.availableSizes = sizeArr ;
       }

       if (installments) {

        if (!validation.isValidinstallments(installments))
          return res.status(400).send({
            status: false,
            message: "installments is invalid",
          });
  
        
  
        filter.installments = Number(installments)
      }

      const updatedProduct = await productModel.findByOneAndUpdate({_id:req.userIdFromParam}, filter, {new:true})
      return res.status(200).send({ status: true, message: 'Success', data: updatedProduct })
    }
    catch (err) {
        return res.status(500).send({ err: err.message })
    }
}
module.exports = { createProduct, getProduct, getProductById, deleteProductById, updateProduct };
