#!/bin/bash

for dir in */; do
    if [ -f "${dir}docker-compose.yml" ]; then
        echo "Running docker-compose in $dir"
        (cd "$dir" && docker-compose up -d)
    fi
done

