import { Button, Input } from "antd";
import { utils } from "ethers";
import React, { useEffect, useState } from "react";
import { Transactor } from "../helpers";
import { useGasPrice } from "../hooks/index.js";
import { Upload, Modal } from 'antd';
import ImgCrop from 'antd-img-crop';
import { PlusOutlined } from '@ant-design/icons';

export default function YourPixels(props) {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  // status: done, uploading, error
  // 
  const [fileList, setFileList] = useState([])

  useEffect(()=>{
    //ownCryptoPixels (startid, width, height)
    const list = new Array(props.ownCryptoPixels.length)
    for(let i = 0; i < props.ownCryptoPixels.length; ++i){

      // Check if image exists or show QR code
      const imageUrl = props.assetsUri + props.ownCryptoPixels[i][0] + '.png'
      fetch(imageUrl, { method: 'HEAD' })
      .then(res => {
          if (!res.ok) {
            imageUrl = props.assetsUri + 'pixels/' + props.ownCryptoPixels[i][0] + '.png'
          }
      }).catch(err => console.log('Error:', err));

      list[i] = {
        uid: props.ownCryptoPixels[i][0],
        name: 'CryptoBlock starting at #' + props.ownCryptoPixels[i][0] + ' | Allowed image-size: ' 
              +props.ownCryptoPixels[i][1]+'px width x '+props.ownCryptoPixels[i][2]+'px height',
        status: 'done',
        maxWidth: props.ownCryptoPixels[i][1],
        maxHeight: props.ownCryptoPixels[i][2],
        url: imageUrl
      }
    }
    console.log(list)
    setFileList(list)

    /* Add additional information
    let el = document.getElementsByClassName('.ant-upload-span')
    for(let i = 0; i < el.length; ++i){
      el.style.setProperty('content', "This is a fancy orange box.";')
    }*/
  }, [])

  let handleCancel = () => {
    setPreviewVisible(false)
  };

  let handlePreview = async file => {
    let src = file.url;
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow.document.write(image.outerHTML)


    /*
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewVisible(true)
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1))
    setPreviewImage(file.url || file.preview)*/
  };

  let handleChange = ({ fileList }) => {
    setFileList(fileList)
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const upload = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    listType: "picture",
    fileList: fileList,
    onPreview: handlePreview,
    onChange: handleChange,
    maxCount: props.ownCryptoPixels.length,
    beforeUpload(file) {
      console.log(file)
      const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          console.log(this.width);
          console.log(this.height);
          
          
        };

      return new Promise(resolve => {
        
      });
    },
  }

  return (
    <div className="textPage">
        <h2>Your Pixels</h2>
        <div>
          <h3>TRANSFER</h3>
        </div>

      <>
      <ImgCrop rotate>
        <Upload {...upload}>
          {fileList.length >= props.ownPixels.length ? null : uploadButton}
        </Upload>
      </ImgCrop>

        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </>

        
        
    </div>
  );
}


function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}