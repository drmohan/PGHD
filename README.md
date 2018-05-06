# PGHD
If there is a cross-origin error when opening index.html, close Chrome then open it by running `open /Applications/Google\ Chrome.app --args --allow-file-access-from-files` from terminal. The file should load as expected on this window. 

To render data for a different patient, change the PATIENT variable [here](https://github.com/drmohan/PGHD/blob/1719d2701f76391b0ff2cab0e5e05d123c455468/main.js#L10)

**JSON structure for patient data:**

```
 {
        "title": "Sleep",           // metric to be displayed
        "status": "green",          // status indicator (must be "red", "yellow", or "green")
        "name": " ",                // only applies to metrics displaying multiple series (i.e. Activity)
        "data": [8,8,7,8,6,6,       // array with y-values 
                 9,8,9,8,9,9,
                 10,11,8,9,9,9,
                 10,10,9,9,8,9,
                 9,10,9,9,8,9,
                 6,9,9], 
        "unit": "hours",            // unit of measurement
        "type": "line",             // type of graph
        "valueDecimals": 1          // decimal point accuracy
    }
```
