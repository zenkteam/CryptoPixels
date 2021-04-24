import { Button, Input } from "antd";
import { utils } from "ethers";
import React, { useEffect, useState } from "react";
import { Transactor } from "../helpers";
import { useGasPrice } from "../hooks/index.js";
import { Upload, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function YourPixels(props) {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  const [fileList, setFileList] = useState([
    {
      uid: '-1',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
    {
      uid: '-4',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
    {
      uid: '-xxx',
      percent: 50,
      name: 'image.png',
      status: 'uploading',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
    {
      uid: '-5',
      name: 'image.png',
      status: 'error',
    },
  ])

  let loadImages = async () => {
    //axios

    /* Get from backend:
    [
      {
        pixelId: 1,
        url: 'http://',
    ]*/
  };

  useEffect(()=>{
    //ownCryptoPixels (startid, width, height)
    const list = new Array(props.ownCryptoPixels.length)
    const map = new Array(props.ownCryptoPixels.length)
    const idList = new Array(props.ownCryptoPixels.length)
    for(let i = 0; i < props.ownCryptoPixels.length; ++i){
      list[i] = {
        uid: props.ownCryptoPixels[i][0],
        name: 'Your CryptoBlock #' + props.ownCryptoPixels[i][0],
        status: 'done',
        maxWidth: props.ownCryptoPixels[i][1],
        maxHeight: props.ownCryptoPixels[i][2]
      }

      map[props.ownCryptoPixels[i][0]] = i
      idList[i] = props.ownCryptoPixels[i][0]
    }

    const images = loadImages(idList)

    images.then((loadedImages) => {
      for(let i = 0; i < loadedImages.length; ++i){
        list[map[loadedImages[i].pixelId]].url = loadedImages[i].url
      }
    })
    
    setFileList(list)
  }, [])

  let handleCancel = () => {
    setPreviewVisible(false)
  };

  let handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewVisible(true)
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1))
    setPreviewImage(file.url || file.preview)
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

  return (
    <div className="textPage">
        <h2>Your Pixels</h2>
        <div>
          <h3>TRANSFER</h3>
        </div>

      <>
        <Upload
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          listType="picture"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          maxCount={props.ownCryptoPixels.length}
        >
          {fileList.length >= props.ownPixels.length ? null : uploadButton}
        </Upload>

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