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

    if ((validation.isValidBody(data))&&(req.files==undefined))
    return res.status(400).send({
      status: false,
      message: "Please!! provide required details to create product",
    });

    if (validation.isValid(title.trim()))
    return res.status(400).send({
      status: false,
      message: "title can't be empty",
    });

  if (!validation.isValidCompString(title.trim()))
    return res.status(400).send({
      status: false,
      message: "title must be a string",
    });

    const titleExist = await productModel.findOne({title:title})
    if(titleExist)
    return res.status(400).send({
      status: false,
      message: "title already exist",
    });

    if (validation.isValid(description.trim()))
        return res.status(400).send({
          status: false,
          message: "description can't be empty",
        });

      if (!validation.isValidCompString(description.trim()))
        return res.status(400).send({
          status: false,
          message: "description must be a string",
        });

   
    if (!validation.isValidPrice(price.trim()))
    return res.status(400).send({
      status: false,
      message: "Price is invalid",
    });

      if ((currencyId!==undefined) && !(("INR").match(currencyId)) )
      return res.status(400).send({
        status: false,
        message: "currencyId INR is invalid",
      });

      if ((currencyFormat !== undefined) && !(("₹").match(currencyFormat)))
      return res.status(400).send({
        status: false,
        message: "currencyformat is invalid",
      });

     

      if (validation.isValid(isFreeShipping))
      return res.status(400).send({
        status: false,
        message: "isFreeShipping can't be empty",
      });


      
      if((isFreeShipping!="false") && (isFreeShipping!="true"))
      return res.status(400).send({
        status: false,
        message: "isFreeShipping must be either true or false",
      });


      if(isFreeShipping=="false"){
        isFreeShipping = (!Boolean(isFreeShipping))
        
       }
        if(isFreeShipping=="true");{
          isFreeShipping = (Boolean(isFreeShipping))
        }

        if (validation.isValid(style))
    return res.status(400).send({
      status: false,
      message: "style can't be empty",
    });

    if (!validation.isValidCompString(style.trim()))
    return res.status(400).send({
      status: false,
      message: "style must be a string",
    });

    if (validation.isValid(installments))
    return res.status(400).send({
      status: false,
      message: "installments can't be empty",
    });


    if (!validation.isValidinstallments(installments))
          return res.status(400).send({
            status: false,
            message: "installments is invalid",
          });

        const sizeArr = availableSizes
        .split(",")
        .map((x) => x.trim());
        
      data.availableSizes = sizeArr;

      if (Array.isArray(sizeArr)) {
        for (let i = 0; i < sizeArr.length; i++) {
            if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(sizeArr[i])==-1)
                return res.status(400).send({ status: false, message: "Please Enter valid sizes, it should include only sizes from  (S,XS,M,X,L,XXL,XL) " })
        }
    }


    if (productImage && productImage.length > 0) {

      
    if (!validation.validImageType(productImage[0].mimetype)) {
      return res
          .status(400)
          .send({
              status: false,
              message: "Uploaded file should be in (jpeg/jpg/png) this format",
          });}

      
      console.log(productImage)
      var uploadedProfilePictureUrl = await AWS.uploadFile(productImage[0]);
    } else {
      return res.status(400).send({ msg: "No file found" });
    }
  

    const productData = {
      title: title,
      description: description.trim(),
      price: price,
      currencyId: currencyId,
      currencyFormat: currencyFormat,
      isFreeShipping: isFreeShipping,
      productImage: uploadedProfilePictureUrl, // s3 link
      style: style,
      availableSizes: sizeArr,
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

    const { name, description, isFreeShipping, style, size, installments, priceGreaterThan, priceLessThan } =
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
    if (size) {
      // console.log(size)
      const sizeArr = size.split(",").map((x) => x.trim());

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
        .status(404)
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
    if (!savedData)
      return res.status(404).send({
        status: false,
        message: "Product not found",
      });

  if (savedData.isDeleted === true)
      return res.status(404).send({
        status: false,
        message: "Product deleted already",
      });

    // updating book.
    let deleteProduct = await productModel.findByIdAndUpdate(
      savedData,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    return res
      .status(204)
      .send({ status: true, message: "Product deleted successfully", data: deleteProduct });

  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

//_________________________________Updateproduct______________________________________________________________


const updateProduct = async function (req, res) {
try {
  let requestBody = req.body;

  productIdFromParam = req.params.productId

  if (!(validation.isValidObjectId(productIdFromParam))) {
    return res
      .status(400)
      .send({ status: false, message: " Please!! input a valid Id :(" });
  }

  let productById = await productModel.findById(productIdFromParam)

    if (!productById) {
      return res.status(404).send({ status: false, message: " Product not found!!!" })
    }

    if(productById.isDeleted==true) {
      return res.status(404).send({ status: false, message: " Product can't be found!!!" })
    }


    

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

    if ((validation.isValidBody(requestBody))&&(req.files==undefined))
    return res.status(400).send({
      status: false,
      message: "Please!! provide required details to update your product",
    });

  
    if (req.files) {
      let productImage = req.files;
      
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
    }

    if (title) {
      

      if (validation.isValid(title.trim()))
        return res.status(400).send({
          status: false,
          message: "title can't be empty",
        });

      if (!validation.isValidCompString(title.trim()))
        return res.status(400).send({
          status: false,
          message: "title must be a string",
        });

        const titleExist = await productModel.findOne({title:title})
        if(titleExist)
        return res.status(400).send({
          status: false,
          message: "title already exist",
        });
    

      filter.title = title
    }

    if (description) {

      if (validation.isValid(description))
        return res.status(400).send({
          status: false,
          message: "description can't be empty",
        });

      if (!validation.isValidCompString(description.trim()))
        return res.status(400).send({
          status: false,
          message: "description must be a string",
        });

      filter.description = description
    }

    if (price) {

      if (!validation.isValidPrice(price.trim()))
        return res.status(400).send({
          status: false,
          message: "Price is invalid",
        });

      

      filter.price = price
    }

    if (currencyId) {

      if ((currencyId==undefined)||!(("INR").match(currencyId)))
      return res.status(400).send({
        status: false,
        message: "currencyId is invalid",
      });

      if (validation.isValid(currencyId))
      return res.status(400).send({
        status: false,
        message: "currencyId can't be empty",
      });

      

      filter.currencyId = currencyId
    }

    if (currencyFormat) {

      if ((currencyFormat==undefined)||!(("₹").match(currencyFormat)))
      return res.status(400).send({
        status: false,
        message: "currencyformat is invalid",
      });

      if (validation.isValid(currencyFormat))
      return res.status(400).send({
        status: false,
        message: "currencyFormat can't be empty",
      });

      
      // if (validation.isValidString(currencyFormat.trim()))
      // return res.status(400).send({
      //   status: false,
      //   message: "currencyFormat must be a string",
      // });

      filter.currencyFormat = currencyFormat
    }

     if(isFreeShipping){

     

      if((isFreeShipping!="false") && (isFreeShipping!="true"))
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

      filter.style = style.trim()
    }

    if(availableSizes){
           const sizeArr = availableSizes
          .split(",")
          .map((x) => x.trim());

          if (Array.isArray(sizeArr)) {
            for (let i = 0; i < sizeArr.length; i++) {
                if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(sizeArr[i])==-1)
                    return res.status(400).send({ status: false, message: "Please Enter valid sizes, it should include only sizes from  (S,XS,M,X,L,XXL,XL) " })
            }
        }
        

        let availSizes = productById.availableSizes
 
         filter.availableSizes = availSizes.concat(sizeArr.filter((item) => availSizes.indexOf(item) < 0))
        
       }

       if (installments) {

        if (!validation.isValidinstallments(installments))
          return res.status(400).send({
            status: false,
            message: "installments is invalid",
          });
  
        
  
        filter.installments = Number(installments)
      }

    

      const updatedProduct = await productModel.findByIdAndUpdate({_id:productIdFromParam}, filter, {new:true})

   
      return res.status(200).send({ status: true, message: 'Success', data: updatedProduct })

      
    }
    catch (err) {
        return res.status(500).send({ err: err.message })
    }
}
module.exports = { createProduct, getProduct, getProductById, deleteProductById, updateProduct };
