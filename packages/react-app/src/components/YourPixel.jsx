import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import React, { useEffect, useState } from "react";
import { Button } from 'antd';

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
  const requestData = {
    pixel_id: props.cryptoPixel.pixel_id,
    pixel_to_id: props.cryptoPixel.pixel_to_id,
    owner: props.walletAddress,
  }
  
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [link, setLink] = useState('');
  const [linkValid, setLinkValid] = useState(false);

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

  function changeLink(event) {
    setLink(event.target.value)
    setLinkValid(validateLink(event.target.value))
  }

  function validateLink(url) {
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    return url.match(regex);
  } 

  function submitLink(event) {
    event.preventDefault()
    if (!linkValid) return
    setLoading(true)
    setLinkValid(false)

    fetch(uploadUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...requestData,
        link: link,
      })
    })
      .then(res => res.json())
      .then(() => props.getApiPixels())
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    if (props.cryptoPixel.image) {
      setImageUrl(assetsUri + props.cryptoPixel.image)
    }
  }, [props.cryptoPixel.image])

  useEffect(() => {
    if (props.cryptoPixel.link) {
      setLink(props.cryptoPixel.link)
    }
  }, [props.cryptoPixel.link])

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
          data={requestData}
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

      <div className="cryptoPixelLink">
        <form onSubmit={submitLink}>
          <label htmlFor="link">Link:</label>
          <input
            name="link"
            type="url"
            value={link}
            onChange={changeLink}
          />
          <Button onClick={submitLink} disabled={!linkValid || loading}>
            {loading ? <LoadingOutlined /> : 'Save Link' }
          </Button>
        </form>
      </div>

    </div>
  );
}
