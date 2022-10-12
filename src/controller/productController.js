const productModel = require("../models/productModel");
const AWS = require("../awsfile/aws");

const createProduct = async function(req, res){
    try{
    let data = req.body 
    let productImage = req.files
    
    let { title, description, price,currencyId,currencyFormat,isFreeShipping, style, availableSizes, installments } = data;
  
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
        installments: installments

    }
    let product = await productModel.create(productData);
    res.status(201).send({
        status: true,
        message: "Product Successfully created",
        data: product,
      });
 } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {createProduct}
