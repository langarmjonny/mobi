#!/bin/bash

set -x

scriptdir=$(dirname "$(readlink -f "$0")")
. $scriptdir/lib.sh

load_config

COO_ADDRESS=$(cat $scriptdir/data/layers/layer.0.csv)

docker pull iotaledger/iri:latest
docker run -t --net=host -e DOCKER_IRI_REMOTE_LIMIT_API="" --rm  -v $scriptdir/db:/iri/data -v $scriptdir/iota.ini:/iri/conf/iota.ini -v $scriptdir/snapshot.txt:/snapshot.txt -p 14265 -p 5555 iotaledger/iri:latest \
       --testnet \
       --remote \
       --testnet-coordinator $COO_ADDRESS \
       --mwm $mwm \
       --milestone-start $milestoneStart \
       --milestone-keys $depth \
       --snapshot /snapshot.txt \
       --max-depth 1000 $@ \
       -c /iri/conf/iota.ini
