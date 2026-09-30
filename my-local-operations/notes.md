 npx expo start -c
 daphne -b 0.0.0.0 -p 8000 my_backend.asgi:application

npx expo start


curl -X POST http://127.0.0.1:8000/zedvye_one/users/login/ \
  -H "Content-Type: application/json" \
  -c cookies.txt -b cookies.txt \
  -d '{
    "identifier": "zedvye_nfeMFY",
    "password": "2025New+!"
  }' | jq

curl -X POST http://127.0.0.1:8000/zedvye_one/users/login/ \
  -H "Content-Type: application/json" \
  -c cookies.txt -b cookies.txt \
  -d '{
    "identifier": "brocode2",
    "password": "2025New+!"
  }' | jq
