import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import React, { useEffect, useState } from "react";

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
  const assetsUri = process.env.REACT_APP_UPLOADED_URI || ''
  const uploadUri = (process.env.REACT_APP_API_URL || '') + 'pixels'
  
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();

  function handleChange(info) {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return;
    }
    if (info.file.status === 'done') {
      // load new image
      props.getApiPixels().then(() => {
        setLoading(false)
      })
    }
  }

  useEffect(() => {
    if (props.cryptoPixel.image) {
      setImageUrl(assetsUri + props.cryptoPixel.image)
    }
  }, [props.cryptoPixel.image])

  return (
    <div key={props.cryptoPixel.pixel_id} className="cryptoPixel">
      { (props.cryptoPixel.pixel_id !== props.cryptoPixel.pixel_to_id) && (
        <div className="cryptoPixelHeader">Area from Pixel-ID { props.cryptoPixel.pixel_id } to Pixel-ID { props.cryptoPixel.pixel_to_id }</div>
      )}
      { (props.cryptoPixel.pixel_id === props.cryptoPixel.pixel_to_id) && (
        <div className="cryptoPixelHeader">Pixel-ID {props.cryptoPixel.pixel_id}</div>
      )}

      <div className="cryptoPixelContent">
        <div className="cryptoPixelAreaWrapper">
          <div className="cryptoPixelArea" style={{ width: props.cryptoPixel.width_px, height: props.cryptoPixel.height_px }}>
          </div>
        </div>

        <div>
          File Requirements:
              <ul>
            <li>file type: png</li>
            <li>width: { props.cryptoPixel.width_px }px</li>
            <li>height: { props.cryptoPixel.height_px }px</li>
          </ul>
        </div>

        <Upload
          name="image"
          listType="picture-card"
          showUploadList={false}
          action={uploadUri}
          data={{
            id: props.cryptoPixel.pixel_id,
            to: props.cryptoPixel.pixel_to_id,
            owner: props.walletAddress,
          }}
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: props.cryptoPixel.width_px, height: props.cryptoPixel.height_px }} /> : (
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
