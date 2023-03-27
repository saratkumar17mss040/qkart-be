# Setup file template to upload data to MongoDB Atlas
# mongoimport --uri mongodb+srv://sarath:008sarathbond@qkart-node.3etl8vb.mongodb.net/qkart?retryWrites=true&w=majority --drop --collection users --file data/export_qkart_users.json
# mongoimport --uri mongodb+srv://sarath:008sarathbond@qkart-node.3etl8vb.mongodb.net/qkart?retryWrites=true&w=majority --drop --collection products --file data/export_qkart_products.json

#!/bin/bash

# Import users collection
mongoimport --uri "mongodb+srv://sarath:008sarathbond@qkart-node.3etl8vb.mongodb.net/qkart?retryWrites=true&w=majority" \
  --drop \
  --jsonArray \
  --collection users \
  --file "data/export_qkart_users.json"

# Import products collection
mongoimport --uri "mongodb+srv://sarath:008sarathbond@qkart-node.3etl8vb.mongodb.net/qkart?retryWrites=true&w=majority" \
  --drop \
  --jsonArray \
  --collection products \
  --file "data/export_qkart_products.json"
