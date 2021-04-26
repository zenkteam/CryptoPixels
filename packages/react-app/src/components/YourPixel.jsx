import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import React, { useEffect, useState } from "react";

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isPng = file.type === 'image/png';
  if (!isPng) {
    message.error('You can only upload PNG files!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }

  return isPng && isLt2M;
}

export default function YourPixel(props) {
  const assetsUri = process.env.REACT_APP_UPLOADED_URI || 'http://localhost:8888/uploads/'
  const uploadUri = process.env.REACT_APP_UPLOAD_URI || 'http://localhost:8888/images'
  
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  
  // check if image exists
  // useEffect(() => {
  //   const imageUrl = assetsUri + props.cryptoPixel[0] + '.png'
  //   fetch(imageUrl, { method: 'HEAD' })
  //     .then(res => {
  //       if (res.ok) {
  //         setImageUrl(imageUrl);
  //       }
  //     })
  //     .catch(() => {
  //       // ignore
  //     })
  // }, [])

  function handleChange(info) {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => {
        setLoading(false)
        setImageUrl(imageUrl)
      })
    }
  }

  return (
    <div key={props.cryptoPixel[0]} className="cryptoPixel">
      { (props.cryptoPixel[1] > 1 || props.cryptoPixel[2] > 1) && (
        <div className="cryptoPixelHeader">Area from Pixel-ID {props.cryptoPixel[3][0]} to Pixel-ID { props.cryptoPixel[3][1] + (props.cryptoPixel[2] - 1) * 100}</div>
      )}
      { (props.cryptoPixel[1] === 1 && props.cryptoPixel[2] === 1) && (
        <div className="cryptoPixelHeader">Pixel-ID {props.cryptoPixel[3][0]}</div>
      )}

      <div className="cryptoPixelContent">
        <div className="cryptoPixelAreaWrapper">
          <div className="cryptoPixelArea" style={{ width: (props.cryptoPixel[1] * 10) + 2, height: (props.cryptoPixel[2] * 10) + 2 }}>
          </div>
        </div>

        <div>
          File Requirements:
              <ul>
            <li>file type: png</li>
            <li>width: {(props.cryptoPixel[1] * 10)}px</li>
            <li>height: {(props.cryptoPixel[2] * 10)}px</li>
          </ul>
        </div>

        <Upload
          name="image"
          listType="picture-card"
          showUploadList={false}
          action={uploadUri}
          data={{
            id: props.cryptoPixel[3][0],
            to: props.cryptoPixel[3][1] + (props.cryptoPixel[2] - 1) * 100,
          }}
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: props.cryptoPixel[1] * 10, height: props.cryptoPixel[2] * 10 }} /> : (
            <div>
              {loading ? <LoadingOutlined /> : <PlusOutlined />}
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      </div>

    </div>
  );
}
