const ServiceWorker = require(
    'file-loader?name=sw.[hash:hex:3].[ext]!./serviceworker.js');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(ServiceWorker).
      then(() => navigator.serviceWorker.ready).
      then(reg => reg.active.postMessage({type: 'ping'})).
      catch(console.error).
      then(() =>
          import('./index'),
      ).
      catch((error) => {
        console.warn(
            '↓ While loading script, expecting [Module], received [Error]');
        console.error(error);
        document.querySelector('#loader-text').innerHTML =
            '<span>脚本下载失败了T^T 刷新试试？</span>' +
            '<pre>' + error.stack + '</pre>';
        return null;
      }).
      then((component) => {
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data.updated !== undefined) {
            let status = event.data.updated;
            window.postMessage({
              type: 'notice',
              payload: {
                source: 'Service Worker',
                content: status
                    ? '准备好了页面的更新，刷新喵~'
                    : (status === null
                        ? '检查更新失败......'
                        :'页面下载完成，没有新任务~'),
                type: event.data.updated ? 'refresh' : (status === null
                                                        ? 'warning'
                                                        : 'success'),
              },
            }, '*');
          } else if (event.data.error !== undefined) {
            window.postMessage({
              type: 'notice',
              payload: {
                source: 'Service Worker',
                content: '网络连接错误，' + event.data.error,
                type: 'error'
              },
            }, '*');
          }
        });
        if(component !== null) {
          document.querySelector('#page-loader').remove();
          document.body.classList.remove('has-loader');
        }
        navigator.serviceWorker.controller.postMessage({type: 'ready'});
      })
        ;
      }
else
  {
    try {
      import('./index');
      document.querySelector('#page-loader').remove();
      document.body.classList.remove('has-loader');
    } catch (error) {
      console.error(error);
      document.querySelector('#loader-text').innerHTML =
          '<span>不支持您的浏览器，请升级QwQ</span>' +
          '<pre>' + error.stack + '</pre>';
    }
  }
