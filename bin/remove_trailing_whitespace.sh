#!/bin/bash
find ./src -type f -exec sed -i 's/ *$//' '{}' ';'
