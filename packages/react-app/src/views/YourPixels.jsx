import { Button, Input } from "antd";
import { utils } from "ethers";
import React, { useEffect, useState } from "react";
import { Transactor } from "../helpers";
import { Upload, Modal } from 'antd';
import ImgCrop from 'antd-img-crop';
import { PlusOutlined } from '@ant-design/icons';

export default function YourPixels(props) {

  const [fileList, setFileList] = useState([])

  // https://ant.design/components/upload/#API
  // https://github.com/nanxiaobei/antd-img-crop

  // Generate File List
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
        thumbUrl: imageUrl
      }
    }
    console.log(list)
    setFileList(list)

  }, [])


  let handlePreview = async file => {
    console.log("preview", file)
    document.getElementById('testtest').click()
    // Call crop form 
  };

  let handleChange = (info) => {
    console.log("info", info.file)
    
    // Validate size


  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const CryptoPixelListItem = ({ originNode, file, fileList }) => {
    const ref = React.useRef();
    const index = fileList.indexOf(file);
// {file.status === 'error' ? errorNode : originNode}
//    const errorNode = <Tooltip title="Upload Error">{originNode.props.children}</Tooltip>;

    // Render the whole file-list. Each file has restrictions which we can handle later in "handlePreview" and validate in "handleChange"
    return (
      <div class="ant-upload ant-upload-select ant-upload-select-picture-card" ref={ref}>
        <span tabindex="0" class="ant-upload" role="button">
          <input type="file" accept="image/*" style="display: none;"/> <img src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" alt="image.png" class="ant-upload-list-item-image"></img>
        </span>
      </div>
    );
  };


  const upload = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    listType: "picture",
    fileList: fileList,
    className: 'avatar-uploader',
    onPreview: handlePreview,
    onChange: handleChange,
    itemRender: (originNode, file, currFileList) => (
      <CryptoPixelListItem
        originNode={originNode}
        file={file}
        fileList={currFileList}
      />
    ),
    maxCount: props.ownCryptoPixels.length,
    beforeUpload(file, fileList) {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        //message.error('You can only upload JPG/PNG file!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
       // message.error('Image must smaller than 2MB!');
      }
      
      // Validate file size metrics
      console.log(file.width, file.height)
    
      return isJpgOrPng && isLt2M;
  
    },
  }

  return (
    <div className="textPage">
      <h2>Your Pixels</h2>
      <div>
        <h3>TRANSFER</h3>
      </div>

      <>
        <ImgCrop rotate id="testtest">
            <Upload {...upload}></Upload>
        </ImgCrop>
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