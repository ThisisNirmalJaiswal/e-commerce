const productModel = require("../models/productModel"); //---------Requiring product model
const AWS = require("../awsfile/aws");  //--------Requiring AWS function from awsFile
const validation = require("../Util/Validations");  //---------Requiring Validation from util folder


/*==========================================CREATE PRODUCT API=============================================*/
const createProduct = async function (req, res) {
  try {

//--------------------------------------Requesting data from body-------------------------------------    
    let data = req.body;

//--------------------------------------Requesting Product image from files-------------------------------------    
    let productImage = req.files;
//--------------------------------------Destructuring Product data-------------------------------------
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
//--------------------------------------va;idation for empty body-------------------------------------
    if ((validation.isValidBody(data))&&(req.files==undefined))
    return res.status(400).send({status: false, message: "Please!! provide required details to create product" });

//--------------------------------------validation for title-------------------------------------
    if (validation.isValid(title))
    return res.status(400).send({status: false, message: "title can't be empty" });

//--------------------------------------Validation for title must be a string value-------------------------------------
  if (!validation.isValidCompString(title.trim()))
    return res.status(400).send({status: false, message: "title must be a string" });

//--------------------------------------looking for Exist title-------------------------------------
    const titleExist = await productModel.findOne({title:title})
    if(titleExist)
    return res.status(400).send({ status: false, message: "title already exist" });

//--------------------------------------Validation for description-------------------------------------
    if (validation.isValid(description.trim()))
        return res.status(400).send({status: false, message: "description can't be empty" });

   
//--------------------------------------Validation for Price Value-------------------------------------
    if (!validation.isValidPrice(price.trim()))
    return res.status(400).send({ status: false, message: "Price is invalid" });
//--------------------------------------Validation for CurrencyId-------------------------------------


if  (typeof currencyId === "string" && currencyId.trim().length === 0)
    return res.status(400).send({status: false, message: "currency id is tickmarked but empty" });


if ((currencyId!==undefined) && !(("INR").match(currencyId)))
      return res.status(400).send({ status: false, message: "currencyId is invalid"});

//--------------------------------------Validation for Currency formart-------------------------------------


if  (typeof currencyFormat === "string" && currencyFormat.trim().length === 0)
    return res.status(400).send({status: false, message: "currencyformat is tickmarked but empty" });
    


if ((currencyFormat !== undefined) && !(("₹").match(currencyFormat)))
      return res.status(400).send({ status: false, message: "currencyformat is invalid" });

//--------------------------------------Validation for isFreeShipping Boolean Type-------------------------------------
     
if  (typeof isFreeShipping === "string" && isFreeShipping.trim().length === 0)
return res.status(400).send({ status: false, message: "isFreeShipping is tickmarked but empty" });

if((isFreeShipping!="false") && (isFreeShipping!="true") && (isFreeShipping!=undefined))
      return res.status(400).send({ status: false, message: "isFreeShipping must be either true or false" });

//--------------------------------------If isFreeShipping is false -------------------------------------      
      if(isFreeShipping=="false")
        {
        isFreeShipping = (!Boolean(isFreeShipping));
        };
//--------------------------------------If isFreeShipping is true -------------------------------------   
        if(isFreeShipping=="true")
        {
          isFreeShipping = (Boolean(isFreeShipping));
        };
//--------------------------------------validation for style-------------------------------------
        if (validation.isValid(style))
    return res.status(400).send({ status: false, message: "style can't be empty"});

//--------------------------------------validation for style that it must be a string-------------------------------------
    if (!validation.isValidCompString(style.trim()))
    return res.status(400).send({ status: false, message: "style must be a string" });

//--------------------------------------Validation for installments-------------------------------------
    if (validation.isValid(installments))
    return res.status(400).send({ status: false, message: "installments can't be empty" });

//---------------Validating installments that installments must be a valid value-------------------------------------
    if (!validation.isValidinstallments(installments))
          return res.status(400).send({ status: false, message: "installments is invalid" });

//---------------making a variable for size validation-------------------------------------
        const sizeArr = availableSizes.split(",").map((x) => x.trim());
        data.availableSizes = sizeArr;

//--------------checking the array that given size is valid or invalid-------------------------------------
      if (Array.isArray(sizeArr)) {
        for (let i = 0; i < sizeArr.length; i++) {
            if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(sizeArr[i])==-1)
                return res.status(400).send({ status: false, message: "Please Enter valid sizes, it should include only sizes from  (S,XS,M,X,L,XXL,XL) " })
        }
    };

//-------------------------checking that Product image is given or not--------------------------------------------------
    if (productImage && productImage.length > 0) {
//----------------------------validating that image is in jpeg/jpg/png format-------------------------------------   
    if (!validation.validImageType(productImage[0].mimetype)) {
      return res.status(400).send({ status: false, message: "Uploaded file should be in (jpeg/jpg/png) this format"});
        }

//-------------------------------Uploading Product image to aws S3 cloud service-------------------------------------
      
      var uploadedProfilePictureUrl = await AWS.uploadFile(productImage[0]);
    } else {
//----------------------------if image not found return a error message -------------------------------------         
      return res.status(404).send({ msg: "No file found" });
    };
  
//--------------------------------------Validating the given data-------------------------------------
    const productData = {
      title: title,
      description: description.trim(),
      price: price,
      currencyId: currencyId,
      currencyFormat: currencyFormat,
      isFreeShipping: isFreeShipping,
      productImage: uploadedProfilePictureUrl, //------s3 link------
      style: style,
      availableSizes: sizeArr,
      installments: installments,
    };
//-----------------------------creating a product-------------------------------------
    let product = await productModel.create(productData);
    return res.status(201).send({ status: true, message: "Product Successfully created", data: product });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
/*==========================================CREATE PRODUCT API END=============================================*/



/*==========================================GET PRODUCTS BY QUERY=============================================*/
const getProduct = async function (req, res) {
  try {
//-------------------------Requesting data from query-------------------------------------   
    let filter = req.query;
    let query = { isDeleted: false };
//-------------------------destructuring Product Data-------------------------------------   
    const { name, description, isFreeShipping, style, size, installments, priceGreaterThan, priceLessThan } =
      filter;
//-------------------------create a regex for test name to title of product-------------------------------------
    let nameIncludes = RegExp(`${filter.name}`);
    if (name) {
      query.title = nameIncludes;
    }
//------------------------requesting description from query-------------------------------------
    if (description) {
      query.description = description.trim();
    };
  
//------------------------requesting isFreeShipping from query-------------------------------------
    if (isFreeShipping) {
      if(isFreeShipping=="false");

      query.isFreeShipping = (!Boolean(isFreeShipping));
      query.isFreeShipping = isFreeShipping;
    };

//-------------------------requesting style from query-------------------------------------
    if (style) {
      query.style = style.trim();
    };

//------------------------requesting Installments from query-------------------------------------
    if (installments) {
      query.installments = installments;
    };

//------------------------requesting size from query-------------------------------------
    if (size) {
      const sizeArr = size.split(",").map((x) => x.trim());
      query.availableSizes = { $all: sizeArr };
    };

//------------------------getting product data by query priceLessThan/priceGreaterThan-------------------------------------
    if (filter.priceGreaterThan && filter.priceLessThan) {
      query.price = { $gt: Number(priceGreaterThan), $lt: Number(priceLessThan) }
    }
    else if (filter.priceGreaterThan) {
      query.price = { $gt: Number(priceGreaterThan) }
    } else if (filter.priceLessThan) {
      query.price = { $lt: Number(priceLessThan) }
    };

//-------------------------getting product details from productModel-------------------------------------------
    let data = await productModel.find({ ...query }).sort({ price: filter.priceSort });

//-------------------------if there is no product by given query it gives a response that "No data Found!!"-------------------------------------
    if (data.length == 0) {
      return res.status(404).send({ status: false, message: "No data Found!!!" });
    };

//--------------------------------------validating empty body-------------------------------------
    return res.status(200).send({status: true, message: "Success", count: data.length, data: data });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};
/*=========================================GET PRODUCTS BY QUERY END==============================================*/



/*==========================================GET PRODUCT BY ID=============================================*/
const getProductById = async function (req, res) {
  try {
//-------------------------getting productId from params-------------------------
    let productId = req.params.productId;

//--------------------------checking that productId is valid or not-------------------------------------
    if (!validation.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: `${productId} not a valid productId` });
    };

//--------------------------Finding the product details from product database --------------------------------------
    let productById = await productModel.findOne({ _id: productId, isDeleted: false,});

//--------------------------if there is no product by given productId -------------------------------------
    if (!productById) {
      return res.status(404).send({ status: false,message: `We can't find any product by this id....${productId}` });
    };

//--------------------------giving the product details by productId-------------------------------------    
    return res.status(200).send({ status: true, message: "success", data: productById });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};
/*==========================================GET PRODUCT BY ID END=============================================*/


/*==========================================DELETE A PRODUCT=============================================*/
const deleteProductById = async function (req, res) {
  try {
//-------------------------requesting productId from params-------------------------
    let productId = req.params.productId

//-------------------------validating productId that it's valid or not--------------------------------------
    if (!validation.isValidObjectId(productId))
      return res.status(400).send({ status: false, message: "Invalid productId" });

//--------------------------Finding the product by productId from product model-------------------------------------
    let savedData = await productModel.findById(productId);

//--------------------------If there is no product by given productId-------------------------------------
    if (!savedData)
      return res.status(404).send({ status: false, message: "Product not found" });

//-------------------------checking that product is deleted or not-------------------------------------
  if (savedData.isDeleted === true)
      return res.status(404).send({ status: false, message: "Product deleted already"});

//--------------------------finding the product and deleting it-------------------------------------
    let deleteProduct = await productModel.findByIdAndUpdate(
      savedData,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

//----------------------------------------------------------------
    return res
      .status(204)
      .send({ status: true, message: "Product deleted successfully", data: deleteProduct });

  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}
/*==========================================DELETE A PRODUCT API END HERE=============================================*/



/*==========================================UPDATING A PRODUCT=============================================*/
const updateProduct = async function (req, res) {
try {

//--------------------------------------validating empty body-------------------------------------  
  let requestBody = req.body;

//--------------------------------------validating empty body-------------------------------------
  productIdFromParam = req.params.productId;

//--------------------------------------validating empty body-------------------------------------  
  if (!(validation.isValidObjectId(productIdFromParam))) {
    return res
      .status(400)
      .send({ status: false, message: " Please!! input a valid Id :(" });
  };

//--------------------------------------validating empty body-------------------------------------
  let productById = await productModel.findById(productIdFromParam);

//--------------------------------------validating empty body-------------------------------------
    if (!productById) {
      return res.status(404).send({ status: false, message: " Product not found!!!" })
    };

//--------------------------------------validating empty body-------------------------------------
    if(productById.isDeleted==true) {
      return res.status(404).send({ status: false, message: " Product can't be found!!!" })
    };

//--------------------------------------validating empty body-------------------------------------
  let filter = {isDeleted:false};

//--------------------------------------validating empty body-------------------------------------
  let { title,
    description, 
    price, 
    currencyId, 
    currencyFormat, 
    isFreeShipping, 
     style, 
    availableSizes, 
    installments  } = requestBody;

//--------------------------------------validating empty body-------------------------------------
    if ((validation.isValidBody(requestBody))&&(req.files==undefined))
    return res.status(400).send({
      status: false,
      message: "Please!! provide required details to update your product",
    });


//--------------------------------------validating empty body-------------------------------------
    if (req.files) {
      let productImage = req.files;

//--------------------------------------validating empty body-------------------------------------      
      if (productImage != undefined && productImage.length > 0) {
        if (!validation.validImageType(productImage[0].mimetype)) {
          return res
              .status(400)
              .send({
                  status: false,
                  message: "Uploaded file should be in (jpeg/jpg/png) this format",
              });
      }
        var updatedProductPictureUrl = await AWS.uploadFile(productImage[0]);
  }
      filter.productImage = updatedProductPictureUrl;
    };

//--------------------------------------validating empty body-------------------------------------
    if (title) {
      if (validation.isValid(title.trim()))
        return res.status(400).send({
          status: false,
          message: "title can't be empty",
        });

//--------------------------------------validating empty body-------------------------------------
      if (!validation.isValidCompString(title.trim()))
        return res.status(400).send({
          status: false,
          message: "title must be a string",
        });

//--------------------------------------validating empty body-------------------------------------
        const titleExist = await productModel.findOne({title:title})
        if(titleExist)
        return res.status(400).send({
          status: false,
          message: "title already exist",
        });
      filter.title = title
    };

//--------------------------------------validating empty body-------------------------------------
    if (description) {

//--------------------------------------validating empty body-------------------------------------
      if (validation.isValid(description))
        return res.status(400).send({
          status: false,
          message: "description can't be empty",
        });

//--------------------------------------validating empty body-------------------------------------
      if (!validation.isValidCompString(description.trim()))
        return res.status(400).send({
          status: false,
          message: "description must be a string",
        });

      filter.description = description
    }

    if (price) {

//--------------------------------------validating empty body-------------------------------------      
      if (!validation.isValidPrice(price.trim()))
        return res.status(400).send({
          status: false,
          message: "Price is invalid",
        });
      filter.price = price
    };

//--------------------------------------validating empty body-------------------------------------
    if (currencyId) {
      if ((currencyId==undefined)||!(("INR").match(currencyId)))
      return res.status(400).send({
        status: false,
        message: "currencyId is invalid",
      });

//--------------------------------------validating empty body-------------------------------------
      if (validation.isValid(currencyId))
      return res.status(400).send({
        status: false,
        message: "currencyId can't be empty",
      });
      filter.currencyId = currencyId
    };

//--------------------------------------validating empty body-------------------------------------
    if (currencyFormat) {

//--------------------------------------validating empty body-------------------------------------
      if ((currencyFormat==undefined)||!(("₹").match(currencyFormat)))
      return res.status(400).send({
        status: false,
        message: "currencyformat is invalid",
      });

//--------------------------------------validating empty body-------------------------------------
      if (validation.isValid(currencyFormat))
      return res.status(400).send({
        status: false,
        message: "currencyFormat can't be empty",
      });

      
     
      filter.currencyFormat = currencyFormat
    }

//--------------------------------------validating empty body-------------------------------------
     if(isFreeShipping){
//--------------------------------------validating empty body-------------------------------------      
      if((isFreeShipping!="false") && (isFreeShipping!="true"))
      return res.status(400).send({
        status: false,
        message: "isFreeShipping must be either true or false",
      });

//--------------------------------------validating empty body-------------------------------------
     if(isFreeShipping=="false"){
      filter.isFreeShipping = (!Boolean(isFreeShipping))
     };
      if(isFreeShipping=="true");{
        filter.isFreeShipping = (Boolean(isFreeShipping))
      };
     };

//--------------------------------------validating empty body-------------------------------------
     if (style) {
//--------------------------------------validating empty body-------------------------------------
      if (validation.isValid(style))
        return res.status(400).send({
          status: false,
          message: "style can't be empty",
        });

//--------------------------------------validating empty body-------------------------------------
      if (!validation.isValidString(style.trim()))
        return res.status(400).send({
          status: false,
          message: "style must be a string",
        });
      filter.style = style.trim()
    };

//--------------------------------------validating empty body-------------------------------------
    if(availableSizes){
           const sizeArr = availableSizes
          .split(",")
          .map((x) => x.trim());

//--------------------------------------validating empty body-------------------------------------
          if (Array.isArray(sizeArr)) {
            for (let i = 0; i < sizeArr.length; i++) {
                if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(sizeArr[i])==-1)
                    return res.status(400).send({ status: false, message: "Please Enter valid sizes, it should include only sizes from  (S,XS,M,X,L,XXL,XL) " })
            }
        };

//--------------------------------------validating empty body-------------------------------------        
        let availSizes = productById.availableSizes
         filter.availableSizes = availSizes.concat(sizeArr.filter((item) => availSizes.indexOf(item) < 0))
       };

//--------------------------------------validating empty body-------------------------------------
       if (installments) {

//--------------------------------------validating empty body-------------------------------------
        if (!validation.isValidinstallments(installments))
          return res.status(400).send({
            status: false,
            message: "installments is invalid",
          });

        filter.installments = Number(installments)
      };

//--------------------------------------validating empty body-------------------------------------
      const updatedProduct = await productModel.findByIdAndUpdate({_id:productIdFromParam}, filter, {new:true})

   
//--------------------------------------validating empty body-------------------------------------
      return res.status(200).send({ status: true, message: 'Success', data: updatedProduct })

      
    }
    catch (err) {
        return res.status(500).send({ err: err.message })
    }
};
/*==========================================UPDATING A PRODUCT API END HERE=============================================*/


/*==========================================EXPORTING ALL APIS=============================================*/
module.exports = { createProduct, getProduct, getProductById, deleteProductById, updateProduct };
