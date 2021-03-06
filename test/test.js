/*
 * Copyright (c) 2014, Verisign, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 * * Neither the names of the copyright holders nor the
 *   names of its contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Verisign, Inc. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

describe("getdns test", function() {
    // requires
    var expect = require('expect.js'),
        getdns = require("../getdns"),
        async  = require("async");

    // Basic creation w/ various opts
    describe("Context Create", function() {
        it("should create a default context", function() {
            var ctx = getdns.createContext();
            expect(ctx).to.be.ok();
            ctx.destroy();
        });

        it("should create a context with options", function() {
            var ctx = getdns.createContext({
                "stub" : true,
                "upstreams" : [
                    "8.8.8.8",
                    ["127.0.0.1", 53]
                ],
                "timeout" : 10
            });
            expect(ctx).to.be.ok();
            ctx.destroy();
        });
    });

    var finish = function(ctx, done) {
        // destroying a context within a callback is not allowed
        expect(ctx.destroy()).to.be.ok();
        expect(ctx.destroy()).to.not.be.ok();
        done();
    };

    describe("Context Query", function() {

        it("should get valid results on lookup getdnsapi.net", function(done) {
            var ctx = getdns.createContext({"stub" : true});
            ctx.lookup("getdnsapi.net", getdns.RRTYPE_A, function(e, result) {
                expect(e).to.not.be.ok(e);
                expect(result).to.be.ok();
                expect(result.just_address_answers).to.be.an(Array);
                expect(result.just_address_answers).to.not.be.empty();
                result.just_address_answers.map(function(r) {
                     expect(r.address_type).to.be.an('string');
                     expect(r.address_data).to.be.an(Buffer);
                });
                finish(ctx, done);
            });
        });
        it("should get valid results on getAddress getdnsapi.net", function(done) {
            var ctx = getdns.createContext({"stub" : true});
            ctx.getAddress("getdnsapi.net", function(e, result) {
                expect(e).to.not.be.ok(e);
                expect(result).to.be.ok();
                expect(result.just_address_answers).to.be.an(Array);
                expect(result.just_address_answers).to.not.be.empty();
                finish(ctx, done);
            });
        });
        it("should get valid results on getService getdnsapi.net", function(done) {
            var ctx = getdns.createContext({"stub" : true});
            ctx.getService("getdnsapi.net", function(e, result) {
                expect(e).to.not.be.ok(e);
                expect(result).to.be.ok();
                expect(result.replies_full).to.be.an(Array);
                expect(result.replies_full).to.not.be.empty();
                finish(ctx, done);
            });
        });
        it("should get valid results on getHostname 8.8.8.8", function(done) {
            var ctx = getdns.createContext({"stub" : true});
            ctx.getHostname("8.8.8.8", function(e, result) {
                expect(e).to.not.be.ok(e);
                expect(result).to.be.ok();
                expect(result.replies_full).to.be.an(Array);
                expect(result.replies_full).to.not.be.empty();
                finish(ctx, done);
            });
        });
        it("should get valid results on address getdnsapi.net", function(done) {
            var ctx = getdns.createContext({"stub" : true});
            ctx.address("getdnsapi.net", function(e, result) {
                expect(e).to.not.be.ok(e);
                expect(result).to.be.ok();
                expect(result.just_address_answers).to.be.an(Array);
                expect(result.just_address_answers).to.not.be.empty();
                finish(ctx, done);
            });
        });
        it("should get valid results on service getdnsapi.net", function(done) {
            var ctx = getdns.createContext({"stub" : true});
            ctx.service("getdnsapi.net", function(e, result) {
                expect(e).to.not.be.ok(e);
                expect(result).to.be.ok();
                expect(result.replies_full).to.be.an(Array);
                expect(result.replies_full).to.not.be.empty();
                finish(ctx, done);
            });
        });
        it("should get valid results on hostname 8.8.8.8", function(done) {
            var ctx = getdns.createContext({"stub" : true});
            ctx.hostname("8.8.8.8", function(e, result) {
                expect(e).to.not.be.ok(e);
                expect(result).to.be.ok();
                expect(result.replies_full).to.be.an(Array);
                expect(result.replies_full).to.not.be.empty();
                finish(ctx, done);
            });
        });
        it("should issue concurrent queries", function(done) {
            var ctx = getdns.createContext({"stub" : true});
            var hosts = ["getdnsapi.net", "labs.verisigninc.com", "nlnetlabs.nl"];
            async.map(hosts, ctx.getAddress.bind(ctx), function(err, result) {
                expect(err).to.not.be.ok(err);
                expect(result).to.be.ok();
                expect(result).to.be.an(Array);
                expect(result).to.have.length(hosts.length);
                result.map(function(r) {
                    expect(r.replies_full).to.be.an(Array);
                    expect(r.replies_full).to.not.be.empty();
                });
                finish(ctx, done);
            });
        });

        // timeouts
        it("should timeout", function(done) {
            var ctx = getdns.createContext({
                "stub" : true,
                "timeout" : 1
            });
            ctx.getAddress("getdnsapi.net", function(err, result) {
                expect(err).to.be.ok();
                expect(result).to.not.be.ok();
                expect(err).to.have.property('msg');
                expect(err).to.have.property('code');
                finish(ctx, done);
            });
        });

        it("should not timeout", function(done) {
            var ctx = getdns.createContext({
                "stub" : true,
                "timeout" : 1
            });
            ctx.timeout = 10000;
            ctx.getAddress("getdnsapi.net", function(err, result) {
                expect(err).to.not.be.ok(err);
                expect(result).to.be.ok();
                finish(ctx, done);
            });
        });

        // cancel
        it("should cancel the query", function(done) {
            var ctx = getdns.createContext({"stub" : true});
            var transId = ctx.getAddress("getdnsapi.net", function(err, result) {
                expect(err).to.be.ok();
                expect(result).to.not.be.ok();
                expect(err).to.have.property('msg');
                expect(err).to.have.property('code');
                expect(err.code).to.equal(getdns.CALLBACK_CANCEL);
                finish(ctx, done);
            });
            expect(transId).to.be.ok();
            expect(ctx.cancel(transId)).to.be.ok();
        });

        // type
        it("should have a buffer as rdata_raw", function(done) {
            var ctx = getdns.createContext({
                "stub" : true
            });
            ctx.getAddress("getdnsapi.net", function(err, result) {
                expect(err).to.not.be.ok(err);
                expect(result).to.be.ok();
                expect(result.replies_full).to.be.an(Array);
                expect(result.replies_full).to.not.be.empty();
                result.replies_full.map(function(r) {
                    expect(r).to.be.an(Buffer);
                });
                finish(ctx, done);
            });
        });
    });

    describe("DNSSEC", function() {
        it("should return with dnssec_status", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : true,
                "upstreams" : [
                    "8.8.8.8"
                ]
            });

            ctx.getAddress("getdnsapi.net", function(err, result) {
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                result.replies_tree.map(function(reply) {
                    expect(reply).to.have.property('dnssec_status');
                });
                finish(ctx, done);
            });
         });

         it("should return with dnssec_status getdns.DNSSEC_SECURE when in stub mode fallback", function(done) {
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : false,
                "upstreams" : [
                    "64.6.64.6"
                ]
            });
	    ctx.dns_transport = getdns.TRANSPORT_UDP_FIRST_AND_FALL_BACK_TO_TCP;
            ctx.getAddress("getdnsapi.net", function(err, result) {
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            }); 
        });

        it("should return with dnssec_status getdns.DNSSEC_SECURE when not in stub mode", function(done) {
            var ctx = getdns.createContext({
                "stub" : false,
                "return_dnssec_status" : true,
                "upstreams" : [
                    "64.6.64.6"
                ]
            });
            ctx.getAddress("getdnsapi.net", function(err, result) {
                expect(err).to.not.be.ok();
                result.replies_tree.map(function(reply) {
                    expect(reply).to.have.property('dnssec_status', getdns.DNSSEC_SECURE);
                });
                finish(ctx, done);
            });
        });
    });

    describe("TLS", function() {
        it("TLS should return successfully", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : false,
                "upstreams" : [
                    "185.49.141.38"
                ]
            });
	    ctx.dns_transport = getdns.TRANSPORT_TLS_FIRST_AND_FALL_BACK_TO_TCP_KEEP_CONNECTIONS_OPEN;
            //ctx.address("getdnsapi.net", function(err, result) {
            ctx.general("getdnsapi.net", getdns.RRTYPE_A, function(err, result) {
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            }); 
      });
    });

    describe("TLSHostname", function() {
        it("TLS hostname validation should return successfully", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : false,
                "return_call_reporting" : true,
                "upstreams" : [
                    "185.49.141.38"// , 853, "getdnsapi.net"
                ]
            });

        porttls = 853;
        var upstreamresolvers = [];
        upstreamresolvers.push("185.49.141.38");
        upstreamresolvers.push(porttls);
        upstreamresolvers.push("getdnsapi.net");
        var up1 = [];
        up1.push(upstreamresolvers);

// create the contexts we need to test with the above options
        ctx.upstream_recursive_servers = up1;


        ctx.tls_authentication = getdns.AUTHENTICATION_HOSTNAME;
        ctx.dns_transport = getdns.TRANSPORT_TLS_ONLY_KEEP_CONNECTIONS_OPEN;
        ctx.general("getdnsapi.net", getdns.RRTYPE_A, function(err, result) {
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            });
        });
    });


    describe("TLS_vlabs", function() {
        it("TLS only should return successfully", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : false,
                "upstreams" : [
                    "173.255.254.151"
                ]
            });
	    ctx.dns_transport = getdns.TRANSPORT_TLS_ONLY_KEEP_CONNECTIONS_OPEN;
            ctx.general("starttls.verisignlabs.com", getdns.RRTYPE_A, function(err, result) {
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            }); 
        });
        it("TLS tls fallback tcp should return successfully", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : false,
                "upstreams" : [
                    "173.255.254.151"
                ]
            });
	    ctx.dns_transport = getdns.TRANSPORT_TLS_FIRST_AND_FALL_BACK_TO_TCP_KEEP_CONNECTIONS_OPEN;
            ctx.general("starttls.verisignlabs.com", getdns.RRTYPE_A, function(err, result) {
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            }); 
        });
        it("TLS starttls first should return successfully", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : false,
                "upstreams" : [
                    "173.255.254.151"
                ]
            });
            // todo debug ctx.dns_transport = getdns.TRANSPORT_STARTTLS_FIRST_AND_FALL_BACK_TO_TCP_KEEP_CONNECTIONS_OPEN;
	    ctx.dns_transport = getdns.TRANSPORT_TCP_ONLY;
            ctx.general("starttls.verisignlabs.com", getdns.RRTYPE_A, function(err, result) {
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            }); 
        });
    });

    describe("TSIG", function() {
        it("TSIG should return successfully", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : false,
                "upstreams" : [
                    "185.49.141.37" // , 853 , "^hmac-md5.tsigs.getdnsapi.net:16G69OTeXW6xSQ=="
                ]
            });
        port = 53;
        var upstreamresolvers = [];
        upstreamresolvers.push("185.49.141.37");
        upstreamresolvers.push(port);
        upstreamresolvers.push("^hmac-md5.tsigs.getdnsapi.net:16G69OTeXW6xSQ==");
        var up1 = [];
        up1.push(upstreamresolvers);
// create the contexts we need to test with the above options
        ctx.upstream_recursive_servers = up1;
        ctx.general("getdnsapi.net", getdns.RRTYPE_SOA, {"return_call_reporting" : true}, function(err, result) {
                expect(result.replies_tree[0].tsig_status).to.be.equal(400);
                expect(result.call_reporting).to.not.be.empty();
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            }); 
        });
    });


    describe("BADDNS", function() {
        it("BADDNS should return successfully", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : false,
                "upstreams" : [
                    "8.8.8.8"
                ]
            });
            ctx.general("_443._tcp.www.nlnetlabs.nl", getdns.RRTYPE_TXT, {"add_warning_for_bad_dns" : true}, function(err, result) {
                expect(result.replies_tree[0].bad_dns).to.not.be.empty();
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            });
      });
    });
    
    describe("SUFFIX", function() {
        it("SUFFIX should return successfully", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : false,
                "upstreams" : [
                    "8.8.8.8"
                ]
            });
            port = 53;
            var upstreamresolvers = [];
            upstreamresolvers.push("8.8.8.8");
            upstreamresolvers.push(port);
            upstreamresolvers.push("~getdnsapi.net,net");
            var up1 = [];
            up1.push(upstreamresolvers);
            ctx.upstream_recursive_servers = up1;
            ctx.general("www.verisignlabs", getdns.RRTYPE_A, function(err, result) {
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            });
      });
    });

    describe("ALLSTATUS", function() {
        it("ALLSTATUS should return successfully", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : true,
                "upstreams" : [
                    "8.8.8.8"
                ]
            });
            ctx.general("dnssec_failed.org", getdns.RRTYPE_A, {"dnssec_return_all_statuses" : true}, function(err, result) {
                expect(err).to.not.be.ok();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            });
      });
    });
    
    describe("APPENDNAME", function() {
        it("APPENDNAME should return successfully", function(done) {
            this.timeout(10000);
            var ctx = getdns.createContext({
                "stub" : true,
                "return_dnssec_status" : false,
                "upstreams" : [
                    "8.8.8.8"
                ]
            });
            ctx.suffix = "org";           
	    ctx.append_name = getdns.APPEND_NAME_ALWAYS; //APPEND_NAME_TO_SINGLE_LABEL_FIRST;
            ctx.general("www.verisignlabs", getdns.RRTYPE_A, {"return_call_reporting" : true}, function(err, result) {
//                console.log(JSON.stringify(result, null, 2));
                expect(err).to.not.be.ok();
                expect(result.call_reporting).to.not.be.empty();
                expect(result.replies_tree).to.be.an(Array);
                expect(result.replies_tree).to.not.be.empty();
                finish(ctx, done);
            });
      });
    });
});

