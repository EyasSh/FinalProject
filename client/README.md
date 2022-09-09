I think you should go to your node_modules/react-scripts/config/webpack.config.json and there write the following code in resolve block

```
fallback: {
           "crypto": require.resolve("crypto-browserify")
}  
```
Note: crypto-browserify should be installed
