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

#ifndef _GNCONTEXT_H_
#define _GNCONTEXT_H_

#include <node.h>
#include <nan.h>
#include <getdns/getdns.h>

// Getdns Context wrapper for Node
class GNContext : public Nan::ObjectWrap {
public:
    // Node module initializer
    static void Init(v8::Local<v8::Object> target);

private:
    GNContext();
    ~GNContext();

    // set options on the context
    static void ApplyOptions(v8::Local<v8::Object> self,
                             v8::Local<v8::Value> opts);

    // JS Functions
    static NAN_METHOD(New);
    static NAN_METHOD(Destroy);
    static NAN_METHOD(Lookup);
    static NAN_METHOD(HelperLookup);
    static NAN_METHOD(Cancel);

    static void InitProperties(v8::Local<v8::Object> self);
    static NAN_GETTER(GetContextValue);
    static NAN_SETTER(SetContextValue);

    // Getdns Callback
    static void Callback(getdns_context *this_context,
                         getdns_callback_type_t cbType,
                         getdns_dict *response,
                         void *userArg,
                         getdns_transaction_t this_transaction_id);

    // Underlying getdns_context
    struct getdns_context* context_;

};

#endif
